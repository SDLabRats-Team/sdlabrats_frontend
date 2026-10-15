---
layout: sdlabrats
permalink: /sign-in/
hide: true
search_exclude: true
scripts: [labrats-signin.js]
---
<div class="labrats__split labrats__split--narrow-aside">
  <section class="labrats__section" aria-labelledby="signin-title">
    <h2 id="signin-title" class="labrats__visually-hidden">Sign in</h2>
    <div data-labrats-signed-in hidden>
      <p>You're signed in as <strong data-labrats-user-name></strong>.</p>
      <div class="ocs__links">
        <a class="ocs__btn signal fill" href="{{ '/account/' | relative_url }}">My assignments</a>
        <a class="ocs__btn accent" href="{{ '/admin/' | relative_url }}" data-labrats-admin-link hidden>Admin console</a>
        <button class="ocs__btn accent" type="button" data-labrats-sign-out>Sign out</button>
      </div>
    </div>
    {% include projects/sdlabrats/signin-form.html form="signin" %}
  </section>
  <aside class="labrats__section" aria-labelledby="signin-help-title">
    <h2 id="signin-help-title">Need help?</h2>
    <p>Forgot your password or need an account? Call <a data-labrats-org-href="{phone_href}"><span data-labrats-org="phone"></span></a> or <a href="{{ '/contact/#contact' | relative_url }}">send us a message</a>, and LabRats staff will reset it.</p>
    <p>Staff: sign in here or go straight to the <a href="{{ '/admin/' | relative_url }}">admin console</a>.</p>
  </aside>
</div>
