import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';

class ConnectedUsersView extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }
      </style>

      <div class="card">
        <h1>Connected Users</h1>
        TODO: Table
      </div>
    `;
  }
}

window.customElements.define('connected-users-view', ConnectedUsersView);