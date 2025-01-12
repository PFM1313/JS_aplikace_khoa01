/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// Set to client ID and API key from the Developer Console
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY_GOOGLE;
// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar";

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById("authorize_button").style.visibility = "hidden";
document.getElementById("signout_button").style.visibility = "hidden";

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }
      $("#signout_button").css("visibility", "visible");
      $("#authorize_button").text("Refresh");
      listUpcomingEvents(); // Optional: Add this if you want to list events after authentication
    },
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("authorize_button").style.visibility = "visible";
  }
}

/**
 * Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    $("#content").text("");
    $("#authorize_button").text("Authorize");
    $("#signout_button").css("visibility", "hidden");
  }
}

/**
 * Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    $("#signout_button").css("visibility", "visible");
    $("#authorize_button").text("Refresh");
    await listUpcomingEvents();
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }

  const events = response.result.items;
  console.log(events);
  if (!events || events.length == 0) {
    document.getElementById("content").innerText = "No events found.";
    return;
  }
  // Flatten to string to display
  const output = events.reduce(
    (str, event) =>
      `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
    "Events:\n"
  );
  document.getElementById("content").innerText = output;
}

function loadGoogleScripts() {
  // Function to dynamically load a script
  function loadScript(src, onLoadCallback, onErrorCallback) {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;

    script.onload = function () {
      console.log(`Script loaded: ${src}`);
      if (onLoadCallback) onLoadCallback();
    };

    script.onerror = function () {
      console.error(`Failed to load script: ${src}`);
      if (onErrorCallback) onErrorCallback();
    };

    document.body.appendChild(script);
  }

  // Load the Google API script
  loadScript("https://apis.google.com/js/api.js", gapiLoaded, () =>
    console.error("Failed to load Google API")
  );

  // Load the Google Identity Services script
  loadScript("https://accounts.google.com/gsi/client", gisLoaded, () =>
    console.error("Failed to load Google Identity Services")
  );
}

// Call the function to load the scripts
loadGoogleScripts();

function addEvent(task) {
  const { name, description, start, end } = task;
  const event = {
    summary: name,
    description,
    start: {
      dateTime: start,
      timeZone: "Europe/Prague",
    },
    end: {
      dateTime: end,
      timeZone: "Europe/Prague",
    },
    recurrence: ["RRULE:FREQ=DAILY;COUNT=1"],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const request = gapi.client.calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  request.execute(function (event) {
    console.log("Event created: " + event.htmlLink);
  });
}

export { handleAuthClick, handleSignoutClick, addEvent };
