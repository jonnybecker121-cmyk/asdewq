function appOrigin(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'sprachplaner:' && url.host === 'app' && !url.username && !url.password;
  } catch { return false; }
}
function allowAudioRequest(pageURL, permission, details) {
  return appOrigin(pageURL) && appOrigin(details.requestingUrl) && permission === 'media'
    && Array.isArray(details.mediaTypes) && details.mediaTypes.length > 0
    && details.mediaTypes.every(type => type === 'audio');
}
function allowAudioCheck(pageURL, permission, requestingOrigin, details) {
  return appOrigin(pageURL) && appOrigin(requestingOrigin) && permission === 'media' && details.mediaType === 'audio';
}
module.exports = { allowAudioRequest, allowAudioCheck };
