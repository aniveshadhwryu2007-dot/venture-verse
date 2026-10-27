// Add these functions to the Apps Script project attached to the registration form.
// These are public client keys. Never use a service_role key in Apps Script or
// a public website. Anonymous access is limited to INSERT by the database RLS.

const FORM_ID = '1wxHZAVYA-7NXFzE5p0KZkXVf6HRKZe9fA5hYHho34b4';
const SUPABASE_URL = 'https://wsrohwermxdndnhpogwz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YKFctAwC1MvgbLpjpjPOng_wvmkSDec';
const SUPABASE_ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzcm9od2VybXhkbmRuaHBvZ3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0Mjk3MTQsImV4cCI6MjEwODAwNTcxNH0.CAml6DLu7XRiDSQBz_DcO9XC78LxOvgRa25lahaL790';

function installSupabaseSubmissionSync() {
  const form = FormApp.openById(FORM_ID);
  const existing = ScriptApp.getProjectTriggers().some(
    (trigger) => trigger.getHandlerFunction() === 'saveRegistrationToSupabase'
  );
  if (!existing) {
    ScriptApp.newTrigger('saveRegistrationToSupabase')
      .forForm(form)
      .onFormSubmit()
      .create();
  }
}

function saveRegistrationToSupabase(event) {
  const answers = {};
  event.response.getItemResponses().forEach((itemResponse) => {
    answers[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  });

  const payload = {
    source: 'google_form',
    submission_type: 'registration',
    event_name: answers.Event || null,
    full_name: answers['Full name'],
    email: answers['Email address'],
    phone: answers['Phone number'],
    organization: answers['College / organization'],
    message: answers['Questions or additional details'] || null,
    answers: {
      team_name: answers['Team name (if applicable)'] || null,
      team_members: answers['Team members’ names (if applicable)'] || null,
    },
  };

  const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/form_submissions`, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_JWT}`,
      Prefer: 'return=minimal',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() >= 300) {
    throw new Error(`Supabase insert failed (${response.getResponseCode()}): ${response.getContentText()}`);
  }
}
