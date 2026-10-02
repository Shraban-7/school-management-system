<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\Student;
use App\Models\ZktecoDevice;

class ZktecoService
{
    const CMD_CONNECT = 1000;
    const CMD_EXIT = 1001;
    const CMD_ENABLEDEVICE = 1002;
    const CMD_DISABLEDEVICE = 1003;
    const CMD_ATTLOG_RRQ = 13;
    const CMD_ACK_OK = 2000;
    const CMD_ACK_ERROR = 2001;
    const CMD_ACK_DATA = 2002;
    const CMD_ACK_UNAUTH = 2005;

    public static function createHeader(int $command, int $checksum, int $sessionId, int $replyId): string
    {
        $buf = pack('vvvv', $command, $checksum, $sessionId, $replyId);
        $checksum = self::calculateChecksum($buf);

        return pack('vvvv', $command, $checksum, $sessionId, $replyId);
    }

    public static function calculateChecksum(string $bytes): int
    {
        $chk = 0;
        $len = strlen($bytes);
        for ($i = 0; $i < $len; $i += 2) {
            if ($i + 1 < $len) {
                $val = unpack('v', substr($bytes, $i, 2))[1];
            } else {
                $val = ord($bytes[$i]);
            }
            $chk += $val;
            while ($chk > 0xFFFF) {
                $chk = ($chk & 0xFFFF) + ($chk >> 16);
            }
        }

        return (~$chk) & 0xFFFF;
    }

    /**
     * Test network connection to a ZKTeco terminal.
     */
    public function testConnection(string $ip, int $port = 4370, string $protocol = 'udp', int $timeoutSeconds = 2): array
    {
        $startTime = microtime(true);

        if (strtolower($protocol) === 'tcp') {
            $errno = 0;
            $errstr = '';
            $fp = @fsockopen($ip, $port, $errno, $errstr, $timeoutSeconds);
            if ($fp) {
                fclose($fp);
                $latency = round((microtime(true) - $startTime) * 1000, 1);

                return [
                    'success' => true,
                    'message' => "Successfully connected to ZKTeco terminal at {$ip}:{$port} (TCP response in {$latency}ms).",
                    'latency_ms' => $latency,
                ];
            }

            return [
                'success' => false,
                'message' => "Could not reach ZKTeco terminal at {$ip}:{$port} ({$errstr} [{$errno}]).",
                'latency_ms' => null,
            ];
        }

        // UDP probe
        if (! function_exists('socket_create')) {
            $errno = 0;
            $errstr = '';
            $fp = @fsockopen("udp://{$ip}", $port, $errno, $errstr, $timeoutSeconds);
            if ($fp) {
                fclose($fp);
                $latency = round((microtime(true) - $startTime) * 1000, 1);

                return [
                    'success' => true,
                    'message' => "ZKTeco UDP socket open at {$ip}:{$port} ({$latency}ms).",
                    'latency_ms' => $latency,
                ];
            }

            return [
                'success' => false,
                'message' => "Could not open UDP socket to {$ip}:{$port}.",
                'latency_ms' => null,
            ];
        }

        try {
            $socket = @socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
            if (! $socket) {
                return [
                    'success' => false,
                    'message' => 'Unable to create UDP socket: '.socket_strerror(socket_last_error()),
                    'latency_ms' => null,
                ];
            }

            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => $timeoutSeconds, 'usec' => 0]);
            socket_set_option($socket, SOL_SOCKET, SO_SNDTIMEO, ['sec' => $timeoutSeconds, 'usec' => 0]);

            $connectPacket = self::createHeader(self::CMD_CONNECT, 0, 0, 0);
            @socket_sendto($socket, $connectPacket, strlen($connectPacket), 0, $ip, $port);

            $buffer = '';
            $from = '';
            $recvPort = 0;
            $bytes = @socket_recvfrom($socket, $buffer, 1024, 0, $from, $recvPort);

            @socket_close($socket);

            $latency = round((microtime(true) - $startTime) * 1000, 1);

            if ($bytes !== false && $bytes >= 8) {
                $header = unpack('vcommand/vchecksum/vsession_id/vreply_id', substr($buffer, 0, 8));
                if ($header['command'] === self::CMD_ACK_OK || $header['command'] === self::CMD_ACK_UNAUTH) {
                    return [
                        'success' => true,
                        'message' => "ZKTeco terminal responded successfully at {$ip}:{$port} ({$latency}ms).",
                        'latency_ms' => $latency,
                    ];
                }
            }

            return [
                'success' => false,
                'message' => "No response from ZKTeco terminal at {$ip}:{$port}. Check if device is powered on and IP is accessible.",
                'latency_ms' => null,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Connection test error: '.$e->getMessage(),
                'latency_ms' => null,
            ];
        }
    }

    /**
     * Pull attendance logs over network socket from a configured ZKTeco terminal.
     */
    public function pullAttendanceFromDevice(ZktecoDevice $device): array
    {
        if (! $device->is_enabled) {
            return [
                'success' => false,
                'message' => 'ZKTeco device is currently disabled in settings.',
                'punches' => [],
            ];
        }

        if (! function_exists('socket_create')) {
            return [
                'success' => false,
                'message' => 'PHP sockets extension is required for direct device connection. You can also import logs via USB (.dat/.txt file).',
                'punches' => [],
            ];
        }

        $ip = $device->ip_address;
        $port = $device->port ?: 4370;

        try {
            $socket = @socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
            if (! $socket) {
                return [
                    'success' => false,
                    'message' => 'Could not initialize UDP socket: '.socket_strerror(socket_last_error()),
                    'punches' => [],
                ];
            }

            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => 3, 'usec' => 0]);
            socket_set_option($socket, SOL_SOCKET, SO_SNDTIMEO, ['sec' => 3, 'usec' => 0]);

            $connectPacket = self::createHeader(self::CMD_CONNECT, 0, 0, 0);
            @socket_sendto($socket, $connectPacket, strlen($connectPacket), 0, $ip, $port);

            $buffer = '';
            $from = '';
            $fromPort = 0;
            $bytes = @socket_recvfrom($socket, $buffer, 1024, 0, $from, $fromPort);

            if ($bytes === false || $bytes < 8) {
                @socket_close($socket);

                return [
                    'success' => false,
                    'message' => "Terminal at {$ip}:{$port} did not respond.",
                    'punches' => [],
                ];
            }

            $header = unpack('vcommand/vchecksum/vsession_id/vreply_id', substr($buffer, 0, 8));
            $sessionId = $header['session_id'];
            $replyId = $header['reply_id'];

            if ($header['command'] !== self::CMD_ACK_OK) {
                @socket_close($socket);

                return [
                    'success' => false,
                    'message' => "Device returned status code: {$header['command']}.",
                    'punches' => [],
                ];
            }

            $readPacket = self::createHeader(self::CMD_ATTLOG_RRQ, 0, $sessionId, $replyId);
            @socket_sendto($socket, $readPacket, strlen($readPacket), 0, $ip, $port);

            $dataBuffer = '';
            while (true) {
                $chunk = '';
                $r = @socket_recvfrom($socket, $chunk, 65535, 0, $from, $fromPort);
                if ($r === false || $r === 0) {
                    break;
                }
                $dataBuffer .= $chunk;
                if ($r < 1024) {
                    break;
                }
            }

            $exitPacket = self::createHeader(self::CMD_EXIT, 0, $sessionId, $replyId);
            @socket_sendto($socket, $exitPacket, strlen($exitPacket), 0, $ip, $port);
            @socket_close($socket);

            $punches = $this->parseBinaryAttendanceBuffer($dataBuffer);

            return [
                'success' => true,
                'message' => 'Successfully pulled '.count($punches).' records from device.',
                'punches' => $punches,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Device error: '.$e->getMessage(),
                'punches' => [],
            ];
        }
    }

    /**
     * Parse binary ZKTeco buffer into normalized punches.
     */
    public function parseBinaryAttendanceBuffer(string $buffer): array
    {
        $punches = [];
        if (strlen($buffer) < 8) {
            return $punches;
        }

        if (preg_match('/(\d+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/', $buffer)) {
            return $this->parseAttendanceLogContent($buffer);
        }

        $offset = 8;
        $recordSize = 40;
        $totalLen = strlen($buffer);

        while ($offset + $recordSize <= $totalLen) {
            $record = substr($buffer, $offset, $recordSize);
            $offset += $recordSize;

            $pin = trim(substr($record, 0, 24));
            $timeRaw = unpack('V', substr($record, 24, 4))[1] ?? 0;
            if ($timeRaw > 0) {
                $second = $timeRaw % 60;
                $timeRaw = (int) ($timeRaw / 60);
                $minute = $timeRaw % 60;
                $timeRaw = (int) ($timeRaw / 60);
                $hour = $timeRaw % 24;
                $timeRaw = (int) ($timeRaw / 24);
                $day = ($timeRaw % 31) + 1;
                $timeRaw = (int) ($timeRaw / 31);
                $month = ($timeRaw % 12) + 1;
                $year = (int) ($timeRaw / 12) + 2000;

                if ($year >= 2020 && $year <= 2040 && $month >= 1 && $month <= 12 && $day >= 1 && $day <= 31) {
                    $pad = fn ($n) => str_pad((string) $n, 2, '0', STR_PAD_LEFT);
                    $dateStr = "{$year}-{$pad($month)}-{$pad($day)}";
                    $timeStr = "{$pad($hour)}:{$pad($minute)}:{$pad($second)}";

                    $punches[] = [
                        'pin' => $pin,
                        'timestamp' => "{$dateStr} {$timeStr}",
                        'date' => $dateStr,
                        'time' => $timeStr,
                    ];
                }
            }
        }

        return $punches;
    }

    /**
     * Parse plaintext or USB export attendance logs (.dat, .txt, .csv).
     */
    public function parseAttendanceLogContent(string $content): array
    {
        $punches = [];
        $lines = preg_split('/\r\n|\r|\n/', $content);

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $parts = [];
            if (str_contains($line, "\t")) {
                $parts = explode("\t", $line);
            } elseif (str_contains($line, ',')) {
                $parts = str_getcsv($line);
            } else {
                $parts = preg_split('/\s+/', $line);
                if (count($parts) >= 3 && preg_match('/^\d{4}-\d{2}-\d{2}$/', $parts[1]) && preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $parts[2])) {
                    $parts = [$parts[0], $parts[1].' '.$parts[2], ...array_slice($parts, 3)];
                }
            }

            if (count($parts) < 2) {
                continue;
            }

            $pin = trim($parts[0]);
            $timeStr = trim($parts[1]);

            if (! is_numeric($pin) && in_array(strtolower($pin), ['pin', 'user_id', 'userid', 'id', 'enrollid', 'badgenumber'])) {
                continue;
            }

            $dt = date_parse($timeStr);
            if ($dt['error_count'] === 0 && $dt['year'] && $dt['month'] && $dt['day']) {
                $pad = fn ($n) => str_pad((string) $n, 2, '0', STR_PAD_LEFT);
                $date = "{$dt['year']}-{$pad($dt['month'])}-{$pad($dt['day'])}";
                $time = "{$pad($dt['hour'])}:{$pad($dt['minute'])}:{$pad($dt['second'])}";

                $punches[] = [
                    'pin' => $pin,
                    'timestamp' => "{$date} {$time}",
                    'date' => $date,
                    'time' => $time,
                    'status' => $parts[2] ?? 0,
                ];
            }
        }

        return $punches;
    }

    /**
     * Map punches onto students and record attendance in attendance_records table.
     */
    public function processPunches(
        array $punches,
        string $date,
        ?int $classId = null,
        string $mappingField = 'roll_number',
        string $lateThreshold = '09:15:00',
        ?int $takenBy = null
    ): array {
        $datePunches = array_filter($punches, fn ($p) => ($p['date'] ?? '') === $date);

        $earliestPunches = [];
        foreach ($datePunches as $p) {
            $pin = (string) $p['pin'];
            $time = $p['time'];
            if (! isset($earliestPunches[$pin]) || $time < $earliestPunches[$pin]) {
                $earliestPunches[$pin] = $time;
            }
        }

        $query = Student::query();
        if ($classId) {
            $query->where('class_id', $classId);
        }
        $students = $query->get();

        $presentCount = 0;
        $lateCount = 0;
        $updatedCount = 0;

        foreach ($students as $student) {
            $key = match ($mappingField) {
                'id' => (string) $student->id,
                'biometric_id' => (string) ($student->biometric_id ?: $student->roll_number ?: $student->id),
                default => (string) ($student->roll_number ?: $student->id),
            };

            if (isset($earliestPunches[$key])) {
                $punchTime = $earliestPunches[$key];
                $isLate = $punchTime > $lateThreshold;
                $status = $isLate ? 'late' : 'present';
                $remarks = $isLate
                    ? "ZKTeco Biometric Late ({$punchTime})"
                    : "ZKTeco Biometric ({$punchTime})";

                $record = AttendanceRecord::query()
                    ->where('student_id', $student->id)
                    ->whereDate('date', $date)
                    ->first() ?? new AttendanceRecord;

                $record->forceFill([
                    'student_id' => $student->id,
                    'classes_and_sections_id' => $student->class_id ?: ($classId ?: 1),
                    'taken_by' => $takenBy,
                    'date' => $date,
                    'status' => $status,
                    'remarks' => $remarks,
                ])->save();

                $updatedCount++;
                if ($isLate) {
                    $lateCount++;
                } else {
                    $presentCount++;
                }
            }
        }

        return [
            'total_students' => $students->count(),
            'matched_punches' => count($earliestPunches),
            'records_updated' => $updatedCount,
            'present' => $presentCount,
            'late' => $lateCount,
        ];
    }
}
