import React, { useState, useEffect } from 'react'

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: { email: true, push: true, orderUpdates: true, promotions: false },
    appearance: { theme: 'light', compactView: false, animations: true },
    preferences: { language: 'en', dateFormat: 'MM/DD/YYYY', timezone: 'America/New_York' }
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) setSettings(JSON.parse(saved))
  }, [])

  const saveSettings = (newSettings) => {
    localStorage.setItem('appSettings', JSON.stringify(newSettings))
    setSettings(newSettings)
    setMessage({ type: 'success', text: 'Settings saved!' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const updateNotification = (key) => {
    const newSettings = { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } }
    saveSettings(newSettings)
  }

  const updateAppearance = (key, value) => {
    const newSettings = { ...settings, appearance: { ...settings.appearance, [key]: value } }
    saveSettings(newSettings)
  }

  const updatePreference = (key, value) => {
    const newSettings = { ...settings, preferences: { ...settings.preferences, [key]: value } }
    saveSettings(newSettings)
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="fw-bold mb-1"><i className="bi bi-gear-fill me-2 text-primary"></i>Settings</h1>
        <p className="text-muted mb-0">Customize your application preferences</p>
      </div>

      {message.text && (<div className={`alert alert-${message.type} rounded-3 mb-4`}>{message.text}</div>)}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4"><h5 className="fw-bold mb-0"><i className="bi bi-bell me-2 text-primary"></i>Notifications</h5></div>
            <div className="card-body p-4 pt-0">
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" id="email" checked={settings.notifications.email} onChange={() => updateNotification('email')} /><label className="form-check-label fw-semibold" htmlFor="email">Email Notifications</label><p className="text-muted small mb-0">Receive notifications via email</p></div>
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" id="push" checked={settings.notifications.push} onChange={() => updateNotification('push')} /><label className="form-check-label fw-semibold" htmlFor="push">Push Notifications</label><p className="text-muted small mb-0">Browser push notifications</p></div>
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" id="orders" checked={settings.notifications.orderUpdates} onChange={() => updateNotification('orderUpdates')} /><label className="form-check-label fw-semibold" htmlFor="orders">Order Updates</label><p className="text-muted small mb-0">Get notified about orders</p></div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4"><h5 className="fw-bold mb-0"><i className="bi bi-palette me-2 text-primary"></i>Appearance</h5></div>
            <div className="card-body p-4 pt-0">
              <div className="mb-3"><label className="form-label fw-semibold">Theme</label><select className="form-select rounded-3" value={settings.appearance.theme} onChange={(e) => updateAppearance('theme', e.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System Default</option></select></div>
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" id="compact" checked={settings.appearance.compactView} onChange={(e) => updateAppearance('compactView', e.target.checked)} /><label className="form-check-label fw-semibold" htmlFor="compact">Compact View</label><p className="text-muted small mb-0">Reduce spacing for more content</p></div>
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" id="animations" checked={settings.appearance.animations} onChange={(e) => updateAppearance('animations', e.target.checked)} /><label className="form-check-label fw-semibold" htmlFor="animations">Enable Animations</label><p className="text-muted small mb-0">Smooth transitions and effects</p></div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4"><h5 className="fw-bold mb-0"><i className="bi bi-globe2 me-2 text-primary"></i>Preferences</h5></div>
            <div className="card-body p-4 pt-0">
              <div className="mb-3"><label className="form-label fw-semibold">Language</label><select className="form-select rounded-3" value={settings.preferences.language} onChange={(e) => updatePreference('language', e.target.value)}><option value="en">English</option><option value="es">Español</option><option value="fr">Français</option></select></div>
              <div className="mb-3"><label className="form-label fw-semibold">Date Format</label><select className="form-select rounded-3" value={settings.preferences.dateFormat} onChange={(e) => updatePreference('dateFormat', e.target.value)}><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></div>
              <div className="mb-3"><label className="form-label fw-semibold">Time Zone</label><select className="form-select rounded-3" value={settings.preferences.timezone} onChange={(e) => updatePreference('timezone', e.target.value)}><option value="America/New_York">Eastern Time</option><option value="America/Chicago">Central Time</option><option value="America/Los_Angeles">Pacific Time</option></select></div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4"><h5 className="fw-bold mb-0 text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Data Management</h5></div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3"><div><h6 className="fw-semibold mb-1">Export Data</h6><p className="text-muted small mb-0">Download all your data</p></div><button className="btn btn-outline-primary rounded-pill"><i className="bi bi-download me-2"></i>Export</button></div>
              <hr />
              <div className="d-flex justify-content-between align-items-center"><div><h6 className="fw-semibold mb-1 text-danger">Clear All Data</h6><p className="text-muted small mb-0">Permanently delete all data</p></div><button className="btn btn-outline-danger rounded-pill" onClick={() => { if (confirm('Are you sure?')) { localStorage.clear(); window.location.reload(); } }}><i className="bi bi-trash me-2"></i>Clear</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings