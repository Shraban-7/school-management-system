<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Gradesheet</title>
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1e293b; font-size: 12px; margin: 0; }
        .sheet { border: 2px solid #334155; padding: 18px 22px; }
        .head { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 10px; margin-bottom: 12px; }
        .head h1 { margin: 0; font-size: 20px; }
        .head .bn { font-size: 14px; color: #475569; margin: 2px 0; }
        .head .meta { font-size: 11px; color: #64748b; margin-top: 4px; }
        .title { text-align: center; font-size: 14px; font-weight: bold; margin: 8px 0 14px; text-transform: uppercase; letter-spacing: 1px; }
        .info { width: 100%; margin-bottom: 12px; border-collapse: collapse; }
        .info td { padding: 3px 6px; font-size: 12px; }
        .info .label { color: #64748b; width: 90px; }
        table.marks { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        table.marks th, table.marks td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px; }
        table.marks th { background: #f1f5f9; text-align: left; }
        table.marks td.num, table.marks th.num { text-align: center; }
        .fail { color: #b91c1c; font-weight: bold; }
        .summary { width: 100%; border-collapse: collapse; margin-top: 6px; }
        .summary td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 13px; }
        .summary .k { background: #f1f5f9; font-weight: bold; width: 25%; }
        .result-pass { color: #15803d; font-weight: bold; }
        .result-fail { color: #b91c1c; font-weight: bold; }
        .foot { margin-top: 40px; width: 100%; }
        .foot td { font-size: 11px; text-align: center; color: #475569; padding-top: 6px; border-top: 1px solid #94a3b8; }
        .foot-wrap td { border: none; padding: 0 20px; width: 33%; }
    </style>
</head>
<body>
<div class="sheet">
    <div class="head">
        <h1>{{ $report['institution']['name_en'] ?? 'School' }}</h1>
        @if(!empty($report['institution']['name_bn']))
            <div class="bn">{{ $report['institution']['name_bn'] }}</div>
        @endif
        <div class="meta">
            @if(!empty($report['institution']['eiin_number'])) EIIN: {{ $report['institution']['eiin_number'] }} @endif
            @if(!empty($report['institution']['board_affiliation'])) &nbsp;|&nbsp; Board: {{ $report['institution']['board_affiliation'] }} @endif
        </div>
    </div>

    <div class="title">
        Academic Transcript &mdash; {{ $report['exam']['name_en'] }}
    </div>

    <table class="info">
        <tr>
            <td class="label">Student</td>
            <td><strong>{{ $report['student']['name_en'] }}</strong></td>
            <td class="label">Roll</td>
            <td>{{ $report['student']['roll_number'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="label">Class</td>
            <td>{{ $report['student']['class_label'] ?? '—' }}</td>
            <td class="label">Session</td>
            <td>{{ $report['exam']['session_name'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="label">Father</td>
            <td>{{ $report['student']['father_name'] ?? '—' }}</td>
            <td class="label">Mother</td>
            <td>{{ $report['student']['mother_name'] ?? '—' }}</td>
        </tr>
    </table>

    @if(empty($report['summary']['has_marks']))
        <p style="text-align:center;color:#64748b;">No marks have been recorded for this student in this exam.</p>
    @else
        <table class="marks">
            <thead>
                <tr>
                    <th>Subject</th>
                    <th class="num">Written</th>
                    <th class="num">MCQ</th>
                    <th class="num">Practical</th>
                    <th class="num">Total</th>
                    <th class="num">Full</th>
                    <th class="num">Grade</th>
                    <th class="num">Point</th>
                </tr>
            </thead>
            <tbody>
                @foreach($report['subjects'] as $s)
                    <tr>
                        <td>{{ $s['subject_en'] }}</td>
                        <td class="num">{{ $s['is_absent'] ? '—' : rtrim(rtrim(number_format($s['written_marks'] ?? 0, 1), '0'), '.') }}</td>
                        <td class="num">{{ $s['is_absent'] ? '—' : rtrim(rtrim(number_format($s['mcq_marks'] ?? 0, 1), '0'), '.') }}</td>
                        <td class="num">{{ $s['is_absent'] ? '—' : rtrim(rtrim(number_format($s['practical_marks'] ?? 0, 1), '0'), '.') }}</td>
                        <td class="num">{{ $s['is_absent'] ? 'Abs' : rtrim(rtrim(number_format($s['total'] ?? 0, 1), '0'), '.') }}</td>
                        <td class="num">{{ rtrim(rtrim(number_format($s['full_marks'], 1), '0'), '.') }}</td>
                        <td class="num {{ $s['passed'] ? '' : 'fail' }}">{{ $s['grade'] }}</td>
                        <td class="num">{{ number_format($s['point'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="summary">
            <tr>
                <td class="k">Total Marks</td>
                <td>{{ rtrim(rtrim(number_format($report['summary']['total'], 1), '0'), '.') }} / {{ rtrim(rtrim(number_format($report['summary']['full_total'], 1), '0'), '.') }}</td>
                <td class="k">GPA</td>
                <td>{{ $report['summary']['gpa'] === null ? '—' : number_format($report['summary']['gpa'], 2) }}</td>
            </tr>
            <tr>
                <td class="k">Letter Grade</td>
                <td>{{ $report['summary']['grade'] }}</td>
                <td class="k">Result</td>
                <td class="{{ $report['summary']['passed'] ? 'result-pass' : 'result-fail' }}">
                    {{ $report['summary']['passed'] ? 'PASSED' : 'FAILED' }}
                </td>
            </tr>
        </table>
    @endif

    <table class="foot foot-wrap">
        <tr>
            <td>Prepared By</td>
            <td>Class Teacher</td>
            <td>Headmaster</td>
        </tr>
    </table>
</div>
</body>
</html>
