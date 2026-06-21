// router.js — AGIS Visual Translator Router v2.0
// Pure function: string → { intent, object, renderer, camera_action, color, raw }

const SHAPE_RULES = [
  { match: /\bcube\b|\bbox\b|\bblock\b/i,                           object: 'cube',       renderer: 'cube',        color: '#6ea8ff' },
  { match: /\bsphere\b|\bball\b|\borb\b/i,                          object: 'sphere',     renderer: 'sphere',      color: '#ff7ac6' },
  { match: /\btorus\b|\bring\b|\bdoughnut\b/i,                      object: 'torus',      renderer: 'torus',       color: '#ffca58' },
  { match: /\bcylinder\b|\bpipe\b|\btube\b/i,                       object: 'cylinder',   renderer: 'cylinder',    color: '#58ffb4' },
  { match: /\bcone\b|\bpyramid\b/i,                                  object: 'cone',       renderer: 'cone',        color: '#ff7058' },
  { match: /\bplane\b|\bfloor\b|\bground\b/i,                       object: 'plane',      renderer: 'plane',       color: '#a8ffd4' },
  { match: /\boctahedron\b|\bdiamond\b/i,                           object: 'octahedron', renderer: 'octahedron',  color: '#d4a8ff' },
  { match: /\bstar\b/i,                                              object: 'star',       renderer: 'star',        color: '#fff058' },
  { match: /\bforest\b|\btree\b|\bwoods\b/i,                        object: 'forest',     renderer: 'environment', color: '#58c87a' },
  { match: /\bocean\b|\bsea\b|\bwater\b|\blake\b/i,                 object: 'ocean',      renderer: 'environment', color: '#5898ff' },
  { match: /\bspace\b|\bgalaxy\b|\buniverse\b/i,                    object: 'space',      renderer: 'environment', color: '#a8b4ff' },
  { match: /\bcity\b|\burban\b|\bbuilding\b/i,                      object: 'city',       renderer: 'environment', color: '#8888ff' },
  { match: /\bmountain\b|\bhill\b|\bterrain\b/i,                    object: 'mountain',   renderer: 'environment', color: '#b4ffa8' },
];

const INTENT_RULES = [
  { match: /\bshow\b|\bdisplay\b|\brender\b|\bdraw\b|\bgive me\b|\bvisuali[sz]e\b|\bsee\b/i, intent: 'show' },
  { match: /\bhide\b|\bremove\b|\bdisappear\b|\bclear\b/i,  intent: 'hide' },
  { match: /\brotate\b|\bspin\b|\bturn\b/i,                 intent: 'rotate' },
  { match: /\bzoom\b/i,                                      intent: 'zoom' },
  { match: /\bexplode\b|\bburst\b|\bshatter\b/i,            intent: 'explode' },
  { match: /\bpulse\b|\bbreathe\b|\bbounce\b|\bwave\b/i,    intent: 'animate' },
  { match: /\bchange\b|\bswitch\b|\breplace\b|\bswap\b/i,   intent: 'change' },
];

const CAMERA_RULES = [
  { match: /\bzoom in\b|\bclose[r]?\b|\bup close\b|\bfocus\b/i,  camera_action: 'zoom_in'    },
  { match: /\bzoom out\b|\bfar\b|\bback\b|\bwide\b/i,            camera_action: 'zoom_out'   },
  { match: /\borbit\b|\bcircle\b|\bspin around\b/i,              camera_action: 'orbit'      },
  { match: /\btop\b|\bbird.s eye\b|\babove\b|\boverhead\b/i,     camera_action: 'top_down'   },
  { match: /\bfront\b|\bhead[- ]?on\b/i,                         camera_action: 'front'      },
  { match: /\bside\b|\bleft\b|\bright\b/i,                       camera_action: 'side'       },
  { match: /\bfly\b|\bfloat\b|\bdrift\b/i,                       camera_action: 'flythrough' },
];

export function route(input) {
  const text = (input || '').trim();
  if (!text) return { intent: null, object: null, renderer: null, camera_action: 'home', raw: '', error: 'empty', message: 'No input provided.' };

  let object = null, renderer = null, color = '#ffffff';
  for (const r of SHAPE_RULES) { if (r.match.test(text)) { object = r.object; renderer = r.renderer; color = r.color; break; } }

  let intent = 'show';
  for (const r of INTENT_RULES) { if (r.match.test(text)) { intent = r.intent; break; } }

  let camera_action = 'auto';
  for (const r of CAMERA_RULES) { if (r.match.test(text)) { camera_action = r.camera_action; break; } }

  if (!object) return { intent, object: null, renderer: null, camera_action, raw: text, error: 'unresolved', message: `No 3D object matched: "${text}". Try cube, sphere, torus, cone, cylinder, forest, ocean, space…` };

  return { intent, object, renderer, camera_action, color, raw: text };
}

export function describe(d) {
  if (!d) return 'nothing';
  if (d.error) return `⚠ ${d.message || d.error}`;
  return `${d.intent} · ${d.object} · cam: ${d.camera_action}`;
}
