---
layout: sdlabrats
permalink: /admin/
hide: true
search_exclude: true
scripts: [labrats-admin.js]
---
<div data-labrats-admin>
  <p class="labrats__hint" data-labrats-loading>Checking your sign-in...</p>

  <section class="labrats__section labrats__admin-signin" data-labrats-admin-signin aria-labelledby="admin-signin-title" hidden>
    <h2 id="admin-signin-title">Admin sign in</h2>
    <p>Sign in with a LabRats Admin account.</p>
    {% include projects/sdlabrats/signin-form.html form="admin-signin" role="Admin" button="Sign in to the console" %}
  </section>

  <div data-labrats-console hidden>
    <p>Signed in as <strong data-labrats-user-name></strong>. <button class="labrats__text-button" type="button" data-labrats-sign-out>Sign out</button></p>
    <p class="labrats__console-status" role="status" aria-live="polite" data-admin-status></p>

    <div class="labrats__console-tabs" role="tablist" aria-label="Admin tools">
      <button type="button" role="tab" id="tab-users" aria-controls="panel-users" aria-selected="true">Users</button>
      <button type="button" role="tab" id="tab-submissions" aria-controls="panel-submissions" aria-selected="false" tabindex="-1">Form submissions</button>
      <button type="button" role="tab" id="tab-assignments" aria-controls="panel-assignments" aria-selected="false" tabindex="-1">Assignments</button>
      <button type="button" role="tab" id="tab-site" aria-controls="panel-site" aria-selected="false" tabindex="-1">Schedule &amp; notice</button>
    </div>

    <section class="labrats__console-panel" role="tabpanel" id="panel-users" aria-labelledby="tab-users">
      <h2>Users</h2>
      <details class="labrats__panel-form">
        <summary>Add an account</summary>
        <form class="labrats__form" data-admin-form="user" novalidate>
          <div class="labrats__form-grid">
            {% include projects/sdlabrats/field.html form="new-user" name="name" label="Full name" required=true autocomplete="off" %}
            {% include projects/sdlabrats/field.html form="new-user" name="uid" label="Username" required=true autocomplete="off" hint="Letters, numbers, dots, dashes, or underscores." %}
            {% include projects/sdlabrats/field.html form="new-user" name="email" label="Email" type="email" autocomplete="off" %}
            {% include projects/sdlabrats/field.html form="new-user" name="password" label="Temporary password" type="password" required=true autocomplete="new-password" hint="At least 8 characters. Share it with the person directly." %}
            <div class="labrats__field">
              <label for="new-user-role">Role</label>
              <select class="ocs__input" id="new-user-role" name="role" aria-describedby="new-user-role-error">
                <option value="User">Student or family (User)</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
              <p class="labrats__field-error" id="new-user-role-error" hidden></p>
            </div>
          </div>
          <div class="labrats__form-actions">
            <button class="ocs__btn signal fill" type="submit">Create account</button>
            <p class="labrats__form-status" role="status" aria-live="polite"></p>
          </div>
        </form>
      </details>
      <div class="labrats__field labrats__console-search">
        <label for="user-search">Find an account</label>
        <input class="ocs__input" id="user-search" type="search" placeholder="Name or username" data-admin-user-search>
      </div>
      <div data-admin-users></div>
    </section>

    <section class="labrats__console-panel" role="tabpanel" id="panel-submissions" aria-labelledby="tab-submissions" hidden>
      <h2>Form submissions</h2>
      <p>Everything sent through the website's contact, scholarship, partnership, video-idea, and newsletter forms. Mark a submission handled once someone has replied.</p>
      <div class="labrats__console-filters">
        <div class="labrats__field">
          <label for="submission-form">Form</label>
          <select class="ocs__input" id="submission-form" data-admin-submission-filter="form">
            <option value="">All forms</option>
            <option value="contact">Contact</option>
            <option value="scholarship">Scholarship</option>
            <option value="partnership">Partnership</option>
            <option value="video_topic">Video idea</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </div>
        <div class="labrats__field">
          <label for="submission-status">Status</label>
          <select class="ocs__input" id="submission-status" data-admin-submission-filter="status">
            <option value="">Any status</option>
            <option value="new">New</option>
            <option value="handled">Handled</option>
          </select>
        </div>
      </div>
      <div data-admin-submissions></div>
    </section>

    <section class="labrats__console-panel" role="tabpanel" id="panel-assignments" aria-labelledby="tab-assignments" hidden>
      <h2>Assignments</h2>
      <details class="labrats__panel-form">
        <summary>Post an assignment</summary>
        <form class="labrats__form" data-admin-form="assignment" novalidate>
          <div class="labrats__form-grid">
            {% include projects/sdlabrats/field.html form="new-assignment" name="title" label="Title" required=true autocomplete="off" wide=true %}
            {% include projects/sdlabrats/field.html form="new-assignment" name="instructions" label="Instructions" type="textarea" required=true wide=true %}
            {% include projects/sdlabrats/field.html form="new-assignment" name="due_date" label="Due date" type="date" autocomplete="off" %}
            <div class="labrats__field labrats__field--toggle">
              <label class="ocs__toggle">
                <input class="ocs__toggle-input" type="checkbox" role="switch" name="is_open" checked>
                <span class="ocs__toggle-track" aria-hidden="true"></span>
                <span class="ocs__toggle-label">Open for turn-ins</span>
              </label>
            </div>
          </div>
          <div class="labrats__form-actions">
            <button class="ocs__btn signal fill" type="submit">Post assignment</button>
            <p class="labrats__form-status" role="status" aria-live="polite"></p>
          </div>
        </form>
      </details>
      <div data-admin-assignments></div>
    </section>

    <section class="labrats__console-panel" role="tabpanel" id="panel-site" aria-labelledby="tab-site" hidden>
      <h2>Schedule and notice</h2>
      <p>The website reads these from the backend. Open a session to list it on the schedule and show its registration form; close it once its dates pass.</p>
      <details class="labrats__panel-form">
        <summary>Notice above every page</summary>
        <form class="labrats__form" data-admin-form="announcement" novalidate>
          <div class="labrats__form-grid">
            {% include projects/sdlabrats/field.html form="announcement" name="text" label="Notice" autocomplete="off" wide=true %}
            {% include projects/sdlabrats/field.html form="announcement" name="link_text" label="Link text" autocomplete="off" %}
            {% include projects/sdlabrats/field.html form="announcement" name="url" label="Link to" autocomplete="off" hint="A page on this site, like /camps/." %}
            <div class="labrats__field labrats__field--toggle">
              <label class="ocs__toggle">
                <input class="ocs__toggle-input" type="checkbox" role="switch" name="show">
                <span class="ocs__toggle-track" aria-hidden="true"></span>
                <span class="ocs__toggle-label">Show on every page</span>
              </label>
            </div>
          </div>
          <div class="labrats__form-actions">
            <button class="ocs__btn signal fill" type="submit">Save notice</button>
            <p class="labrats__form-status" role="status" aria-live="polite"></p>
          </div>
        </form>
      </details>
      <div data-admin-sessions></div>
    </section>
  </div>
</div>
