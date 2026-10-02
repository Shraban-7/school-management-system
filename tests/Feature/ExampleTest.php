<?php

test('redirects guests to the login page at the root route', function () {
    makeInstitution();

    $this->get(route('home'))->assertRedirect(route('login'));
});
