<?php

test('shows the public school homepage for guests', function () {
    makeInstitution();

    $this->get(route('home'))->assertSuccessful();
});
