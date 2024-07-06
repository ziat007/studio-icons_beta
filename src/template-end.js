
var svg_icons = {};
const iconAlts = {
  "weather-cloudy": "cloud-outline",
  "weather-partlycloudy": "weather-partly-cloudy"
}

/** create element */

class studioIcon extends HTMLElement {
  static observedAttributes = ["icon", "state", "primary-color"];
  constructor() {
    super();
    this._icon = null;
    this._lottie = null;
    this._alts = Object.keys(iconAlts);
    this._list = Object.keys(iconTemplates).concat(this._alts);
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement('style');
    style.textContent = CSStemplate;
    shadow.appendChild(style);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'state') {
      this._state = newValue;
      if (newValue == 'on') {
        if (this._icoType == 'sis') {
          this._lottie.play();
        }
      }
      if (newValue == 'off') {
        if (this._icoType == 'sis') {
          this._lottie.stop();
        }
      }
    }
    if (name == 'primary-color') {
      this.style.setProperty('--studio-icons-color', newValue);
    }
  }
  connectedCallback() {
    const shadow = this.shadowRoot;
    if (this.getAttribute("icon") != null && this._icon == null) {
      this._icon = this.getAttribute("icon").substring(4);
      this._icoType = this.getAttribute("icon").substring(0,3);

      if (this._icoType == 'sil') {
        this._loop = true;
        this._autoplay = true;
      }
      if (this._icoType == 'sis') {
        this._loop = true;
        this._autoplay = false;
      }
      if (!this._list.includes(this._icon)) {
        this._icon = 'sil:alert-box-outline';
      }
      if (this._alts.includes(this._icon)) {
        this._icon = iconAlts[this._icon];
        this.setAttribute('icon-alt', this._icon);
      }
      const wrapper = document.createElement("studio-icon-svg");
      shadow.appendChild(wrapper);
      this._lottie = bodymovin.loadAnimation({
        container: wrapper,
        animationRunning: false,
        loop: this._loop,
        autoplay: this._autoplay,
        renderer: 'svg',
        animationData: iconTemplates[this._icon]
      })
      const iconLoaded = new Promise((resolve) => {
        setTimeout(() => {
          if (this.offsetParent) resolve();
        }, 100);
      });
      iconLoaded.then(() => {
        if (this._icoType == 'sis') {
          var pthis = this;
          if (this.offsetParent.tagName == "HA-CARD" && this.offsetParent.role == 'button') {
            this.offsetParent.addEventListener('mouseenter', function () { mouseEnter(pthis) });
            this.offsetParent.addEventListener('mouseleave', function () { mouseLeave(pthis) });
          } else {
            this.addEventListener('mouseenter', function () { mouseEnter(pthis) });
            this.addEventListener('mouseleave', function () { mouseLeave(pthis) });
          }
        }
      });

      function mouseEnter(pthis) {
        pthis._lottie.setSpeed(2);
        pthis._lottie.play();
      }
      function mouseLeave(pthis) {
        pthis._lottie.setSpeed(1);
        if (pthis._state == 'off') {
          pthis._lottie.stop();
        }
      }
    }    
  }
  disconnectedCallback() {
  }
}

customElements.define("studio-icon", studioIcon);

/** overwrite and preloader for iconlist */

async function getIcon(name) {
  if (!(name in svg_icons)) {
    console.log(`Icon "${name}" not available`);
    return '';
  }
  return {
    path: svg_icons[name],
    viewBox: "0 0 24 24"
  }
}
async function getIconList() {
  return Object.entries(svg_icons).map(([icon]) => ({
    name: icon
  }));
}
window.customIconsets = window.customIconsets || {};
window.customIconsets["sil"] = getIcon;
window.customIcons = window.customIcons || {};
window.customIcons["sil"] = { getIcon, getIconList };

window.customIconsets = window.customIconsets || {};
window.customIconsets["sis"] = getIcon;
window.customIcons = window.customIcons || {};
window.customIcons["sis"] = { getIcon, getIconList };


customElements.whenDefined("ha-state-icon").then((()=>{
  const t = customElements.get("ha-state-icon");
  if (t.prototype.studioicon_patched)
      return;
  t.prototype.studioicon_patched = !0;
  const e = t.prototype.updated;
  t.prototype.updated = function(...t) {
      e.bind(this)(...t),
      studioIconsState(this)
  }
}
)),
customElements.whenDefined("ha-icon").then((()=>{
  Object.keys(iconTemplates).forEach((ele) => {
    let iconDir = document.createElement('ha-icon');
    iconDir.setAttribute('icon', 'mdi:' + ele);
    iconDir._loadIcon().then(()=>{
      svg_icons[ele] = iconDir._path;
    });
  });
  const t = customElements.get("ha-icon");
  if (t.prototype.studioicon_patched)
      return;
  t.prototype.studioicon_patched = !0;
  const e = t.prototype.updated;
  t.prototype.updated = function(...t) {
      e.bind(this)(...t),
      studioIconsOverwrite(this)
  }
}
));

function studioIconsState (haStateIcon) {
  if (typeof haStateIcon.__icon != "undefined" && haStateIcon.__icon != "undefined" 
  && (haStateIcon.__icon.substr(0,3) == "sil" || haStateIcon.__icon.substr(0,3) == "sis")) {
    const cs = window.getComputedStyle(haStateIcon);
    const state = haStateIcon.getAttribute('data-state');
    const sIco = document.createElement('studio-icon');
    sIco.setAttribute('icon', haStateIcon.__icon);
    haStateIcon.shadowRoot.innerHTML = '';
    haStateIcon.shadowRoot.appendChild(sIco);
    haStateIcon.shadowRoot.firstElementChild.setAttribute('primary-color', cs.color);
    haStateIcon.shadowRoot.firstElementChild.setAttribute('state', state);
  }
}

function studioIconsOverwrite (haIcon) {
  if (typeof haIcon.__icon != "undefined" && haIcon.__icon != "undefined" 
  && haIcon.offsetParent != null && typeof haIcon.getAttribute('slot') == "undefined"
  && (haIcon.__icon.substr(0,3) == "sil" || haIcon.__icon.substr(0,3) == "sis")) {
    const sIco = document.createElement('studio-icon');
    const cs = window.getComputedStyle(haIcon);
    sIco.setAttribute('icon', haIcon.__icon);
    if (typeof haIcon.getAttribute('slot') != "undefined") {
      sIco.setAttribute('slot', haIcon.getAttribute('slot'));
    }
    haIcon.after(sIco);
    haIcon.remove();
  }
}

/** vars */

var CSStemplate = `
  :host {
    display: inline-block;
    margin: auto;
    --mdc-icon-size: 100%;
    --iron-icon-width: 100%;
    --iron-icon-height: 100%;
    fill: inherit;
    stroke: inherit;   
    width: var(--mdc-icon-size,24px);
    height: var(--mdc-icon-size,24px); 
  }
  studio-icon-svg {
    display: var(--ha-icon-display,inline-flex);
    align-items: center;
    justify-content: center;
    position: relative;
    vertical-align: middle;
    width: var(--mdc-icon-size,24px);
    height: var(--mdc-icon-size,24px); 
  }
  .background {
    fill: var(--studio-icons-background, var(--ha-card-background,var(--card-background-color,#fff)))
  }
  .outline {
    stroke: var(--studio-icons-color, var(--primary-text-color,var(--icon-primary-color,#000)));
  }
  .inline {
    fill: var(--studio-icons-color, var(--primary-text-color,var(--icon-primary-color,#000)));
  }
`;
    
console.info('%c STUDIO-ICONS 🌸 %c - BETA 0.1', 'color:#3b50cd; background:#cddc39; font-weight:900; font-family: Heebo, sans-serif; padding: 3px; border-radius: 5px;', 'color: #3b50cd; background:none;  font-family: Heebo, sans-serif;');
