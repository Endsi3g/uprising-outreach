// Background Service Worker for ProspectOS Extension
// Ensures the side panel opens on action click

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  console.log("ProspectOS Extension installed.");
});
