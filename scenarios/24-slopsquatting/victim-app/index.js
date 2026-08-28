/**
 * Victim app. A chat snippet told us to install python-asyncio-utils.
 * That name is not a typo of a real package. It never lived in the catalog.
 */
const helper = require('python-asyncio-utils');
console.log('victim-app using', helper.name, helper.parse('{"ok":true}'));
