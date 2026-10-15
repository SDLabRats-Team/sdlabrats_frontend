---
layout: sdlabrats
permalink: /account/
hide: true
search_exclude: true
scripts: [labrats-account.js]
---
<div data-labrats-account>
  <p class="labrats__hint" data-labrats-loading>Checking your sign-in...</p>
  <div data-labrats-account-header hidden>
    <p>Signed in as <strong data-labrats-user-name></strong>. <button class="labrats__text-button" type="button" data-labrats-sign-out>Sign out</button></p>
  </div>
  <p class="labrats__notice" data-labrats-account-error role="alert" hidden></p>
  <div class="labrats__assignments" data-labrats-assignments aria-live="polite"></div>
</div>
