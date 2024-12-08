const { ipcRenderer } = require('electron');

const DEFAULT_PRIMARY_COLOR = '#34495E';
const DEFAULT_SECONDARY_COLOR = '#2C3E50';

function applySettings(settings) {
  if (settings.darkMode) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }

  ipcRenderer.send('toggle-launch-on-startup', settings.launchOnStart);
}

ipcRenderer.on('apply-settings', (e, settings) => {
  applySettings(settings);
});

// Load settings from the main process (ensure you get the latest settings from the settings.json file)
async function loadSettings() {
  const settings = await ipcRenderer.invoke('get-settings');
  console.log('Loaded settings:', settings);
  return settings;
}

// Function to save a setting to the settings file
async function saveSetting(key, value) {
  // Calling the main process to save the setting
  await ipcRenderer.invoke('save-setting', key, value);

  // After saving, reload and apply the settings
  const settings = await ipcRenderer.invoke('get-settings');
  applySettings(settings);
}

const panel = document.querySelector('.panel');
const toggleButton = document.getElementById('toggleButton');
const settingsButton = document.getElementById('settingsButton');
const settingsDropdown = document.getElementById('settingsDropdown');
const toggleLaunchStart = document.getElementById('toggleLaunchStart');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const toggleAutoSave = document.getElementById('toggleAutoSave');

let isPanelVisible = false;

toggleButton.innerHTML = isPanelVisible ? '→' : '←';

// Loading settings and initializing the UI
loadSettings().then((settings) => {
  // Initializing UI elements based on the saved settings
  if (settings) {
    toggleLaunchStart.checked = settings.launchOnStart || false;
    toggleDarkMode.checked = settings.darkMode || false;
    toggleAutoSave.checked = settings.autoSave || false;
  }
});

function togglePanel() {
  isPanelVisible = !isPanelVisible;

  if (isPanelVisible) {
    panel.classList.add('visible');
    toggleButton.innerHTML = '→';
  } else {
    panel.classList.remove('visible');
    toggleButton.innerHTML = '←';
  }

  ipcRenderer.send('toggle-panel', isPanelVisible);
}

toggleButton.addEventListener('click', togglePanel);

// Toggle settings dropdown
settingsButton.addEventListener('click', (e) => {
  e.stopPropagation();
  settingsDropdown.style.display =
    settingsDropdown.style.display === 'block' ? 'none' : 'block';
});

settingsDropdown.addEventListener('click', (e) => {
  e.stopPropagation(); 
});

document.addEventListener('click', () => {
  settingsDropdown.style.display = 'none';
});

// Theme Customizer Toggle
document.querySelector('[data-action="customize-theme"]').addEventListener('click', () => {
  const themeCustomizer = document.getElementById('theme-customizer');
  // Toggle visibility of the customizer
  themeCustomizer.style.display = themeCustomizer.style.display === 'none' ? 'block' : 'none';
});

// Apply Theme logic
document.getElementById('apply-theme-btn').addEventListener('click', () => {
  const primaryColor = document.getElementById('primary-color-picker').value;
  const secondaryColor = document.getElementById('secondary-color-picker').value;

  // Storing theme settings in local storage
  localStorage.setItem('primaryColor', primaryColor);
  localStorage.setItem('secondaryColor', secondaryColor);

  // Update the CSS variables
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--secondary-color', secondaryColor);

  alert(`Primary color set to ${primaryColor}, Secondary color set to ${secondaryColor}`);
});

// Reset to Default logic
document.getElementById('reset-theme-btn').addEventListener('click', () => {
  // Reset color pickers to default
  document.getElementById('primary-color-picker').value = DEFAULT_PRIMARY_COLOR;
  document.getElementById('secondary-color-picker').value = DEFAULT_SECONDARY_COLOR;

  // Storing theme settings in local storage
  localStorage.setItem('primaryColor', DEFAULT_PRIMARY_COLOR);
  localStorage.setItem('secondaryColor', DEFAULT_SECONDARY_COLOR);

  // Reset the applied theme
  document.documentElement.style.setProperty('--primary-color', DEFAULT_PRIMARY_COLOR);
  document.documentElement.style.setProperty('--secondary-color', DEFAULT_SECONDARY_COLOR);

  alert('Theme reset to default!');
});


toggleLaunchStart.addEventListener('change', (e) => {
  saveSetting('launchOnStart', e.target.checked);
});

window.addEventListener('load', () => {
  const primaryColor = localStorage.getItem('primaryColor');
  const secondaryColor = localStorage.getItem('secondaryColor');

  if (primaryColor && secondaryColor) {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
  }
});

toggleDarkMode.addEventListener('change', (e) => {
  saveSetting('darkMode', e.target.checked);
});

toggleAutoSave.addEventListener('change', (e) => {
  saveSetting('autoSave', e.target.checked);
});

const saveBtn = document.getElementById('saveBtn');
const saveAsBtn = document.getElementById('saveAsBtn');

if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    console.log('Save clicked');
    settingsDropdown.style.display = 'none'; 
  });
}

if (saveAsBtn) {
  saveAsBtn.addEventListener('click', () => {
    console.log('Save As clicked');
    settingsDropdown.style.display = 'none'; 
  });
}
