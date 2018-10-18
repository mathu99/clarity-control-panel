import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';

class ActionView extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }
        .pull-right{
          float: right;
        }
      </style>

      <div class="card">
        <h1>Restart Clarity Service</h1>
        <paper-button raised class="green" on-click="restartClarity">Restart Now</paper-button>
      </div>

      <div class="card">
        <h1>Update Server.json</h1>
        <paper-dropdown-menu label="Environment">
        <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{selectedEnvironment}}" attr-for-selected="myid">
            <template is="dom-repeat" items="[[environmentList]]">
              <paper-item myid="[[item.value]]">[[item.name]]</paper-item>
            </template>
          </paper-listbox>
      </paper-dropdown-menu>

      <paper-button raised class="green pull-right" hidden="[[changeConfigBtnHidden]]" on-click="postConfig">Update Config</paper-button>

      <br><br>

      <iron-ajax
        url={{selectedEnvironment}}
        auto
        method="get"
        headers='{"Accept": "*/*"}' 
        handle-as="json"
        last-response="{{configuration}}"
        on-response=handleEnvironmentResponse
        on-error="handleEnvironmentError"
        debounce-duration="300">
      </iron-ajax>

      <iron-ajax
        id="postConfigAjax"
        method="post"
        url="{{selectedEnvironment}}"
        body='[[serverConfig]]'
        handle-as="json"
        content-type="application/json"
        on-response="handleConfigResponse"
        on-error="handleGenericError">
    </iron-ajax>

    <iron-ajax
        id="restartClarityAjax"
        method="post"
        url="{{selectedEnvironment}}"
        body='[[serverConfig]]'
        handle-as="json"
        content-type="application/json"
        on-response="handleRestartResponse"
        on-error="handleGenericError">
    </iron-ajax>

      <vaadin-grid aria-label="Basic Binding Example" items="[[configuration]]">
  
      <vaadin-grid-column width="60px" flex-grow="0">
        <template>
          <vaadin-checkbox aria-label="Select Row" on-click="check" checked="[[item.selected]]"></vaadin-checkbox>
        </template>
      </vaadin-grid-column>

        <vaadin-grid-column width="60px" flex-grow="0">
          <template class="header">#</template>
          <template>[[index]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">
            <vaadin-grid-sorter path="environment">Environment</vaadin-grid-sorter>
          </template>
          <template>[[item.environment]]</template>
        </vaadin-grid-column>
  
       <vaadin-grid-column>
          <template class="header">
            <vaadin-grid-sorter path="countryName">Country</vaadin-grid-sorter>
          </template>
          <template>[[item.countryName]]</template>
        </vaadin-grid-column>
  
        <vaadin-grid-column>
          <template class="header">
            <vaadin-grid-sorter path="branchName">Branch Name</vaadin-grid-sorter>
          </template>
          <template>[[item.branchName]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Clarity Download URL</template>
          <template>[[item.clarityDownloadUrl]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Clarity Service Download URL</template>
          <template>[[item.clarityServiceDownloadUrl]]</template>
        </vaadin-grid-column>
    
      </vaadin-grid>

      <paper-toast id="successToast" class="success-toast fit-bottom" duration="5000">
        [[toastSuccess]]
      </paper-toast>

      <paper-toast id="errorToast" class="error-toast fit-bottom" duration="5000">
        [[toastError]]
      </paper-toast>

      </div>
    `;
  }
  static get properties() {
    return {
      selectedEnvironment: {  /* Default to ProdAF */
        type: String,
        value: 'https://clarityafrica.multichoice.co.za/fefmiddletier/api/installationconfiguration',
      },
      environmentList : {
        type: Array,
        value : [{
          name: 'Production Africa',
          value: 'https://clarityafrica.multichoice.co.za/fefmiddletier/api/installationconfiguration', 
        },{
          name: 'Production SA',
          value: 'https://clarityza.multichoice.co.za/fefmiddletier/api/installationconfiguration', 
        },{
          name: 'Non-Prod',
          value: 'https://clarityafrica-dt.multichoice.co.za/fefmiddletier/api/installationconfiguration', 
        }]
      },
      configuration: {
        type: Array,
      },
      changeConfigBtnHidden: {
        type: Boolean,
        value: true,
      },
      toastSuccess: {
        type: String,
        value: 'Unknown',
      },
      toastError: {
        type: String,
        value: 'Unknown',
      },
      selectedObject: {
        type: Object,
      }
    }
  }
  handleEnvironmentResponse(e) {
    this.changeConfigBtnHidden = true;
    this.configuration = e.detail.response;
  }
  handleEnvironmentError(e) {
    this.changeConfigBtnHidden = true;
    this.toastError = e.detail.error;
    this.$.errorToast.open();
  }
  handleConfigResponse(e) {  /* Un-check all table elements, hide button and notify of success */
    this.configuration = this.configuration.map(e => {
      e.selected = false;
      return e;
    });
    this.changeConfigBtnHidden = true;
    this.toastSuccess = `Clarity Service is now pointing to ${this.selectedObject.item.environment}: ${this.selectedObject.item.countryName} - ${this.selectedObject.item.branchName}`;
    this.$.successToast.open(); 
  }
  handleRestartResponse(e) {
    this.toastSuccess = `Clarity Service is restarting`;
    this.$.successToast.open(); 
  }
  handleGenericError(e) {
    this.toastError = e.detail.error;
    this.$.errorToast.open();
  }

  restartClarity(e) {
    this.$.restartClarityAjax.generateRequest();
  }

  check(e) {  /* Potentially un-check others */
    if (!e.model.__data.selected) {
      this.configuration = this.configuration.map(e => {
        e.selected = false;
        return e;
      });
    }
    e.model.__data.selected = !e.model.__data.selected;
    this.selectedObject = e.model.__data;
    this.changeConfigBtnHidden = !e.model.__data.selected;
  }
  postConfig(e) { /* Invoke iron-ajax to post server.json */
    this.serverConfig = `{"clarityDownloadUrl":"${this.selectedObject.item.clarityDownloadUrl}","updateUrl":"${this.selectedObject.item.clarityDownloadUrl}","clientPostUrl":"${this.selectedObject.item.clientPostUrl}","clarityServiceDownloadUrl":"${this.selectedObject.item.clarityServiceDownloadUrl}}`;
    this.$.postConfigAjax.generateRequest();
  }
}

window.customElements.define('action-view', ActionView);