import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import './shared-styles.js';

class LogView extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
          padding: 10px;
        }
      </style>

      <iron-ajax
        id="getLogsAjax"
        url="http://localhost:51806/{{logPath}}"
        method="get"
        headers='{"Accept": "*/*"}' 
        handle-as="text"
        on-response="handleResponse"
        on-error="handleError"
        debounce-duration="300">
      </iron-ajax>

      <div class="card">
        <h1>Logs</h1>
        <p>Specify a date:</p>
        <paper-radio-group selected="{{selectedDay}}">
          <paper-radio-button name=".log">Today</paper-radio-button>
          <paper-radio-button name=".log.0">Yesterday</paper-radio-button>
          <paper-radio-button name=".log.1">2 Days Ago</paper-radio-button>
          <paper-radio-button name=".log.2">3 Days Ago</paper-radio-button>
        </paper-radio-group>
        <p>Specify one of the following log files from the list:</p>
        <paper-dropdown-menu label="File Name">
        <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{selectedLog}}" attr-for-selected="myid">
            <template is="dom-repeat" items="[[logFileList]]">
              <paper-item myid="[[item.value]]">[[item.name]]</paper-item>
            </template>
          </paper-listbox>
      </paper-dropdown-menu>
      <br><br>
      <paper-button raised class="green" on-tap="getLogFile">Get Log File</paper-button>
      <br>
      <br>
      <paper-textarea rows=5 label="Logs" value="{{logs}}"></paper-textarea>
      </div>
    `;
  }
  static get properties() {
    return {
      selectedDay: {
        type: String,
        value: '.log',
      },
      selectedLog: {
        type: String,
        value: 'clientPostService',
      },
      logs: {
        type: String,
        value: '',
      },
      logPath: {
        type: String,
        value: '',
      },
      logFileList : {
        type: Array,
        value : [{
          name: 'Client Post Service',
          value: 'clientPostService', 
        },{
          name: 'Compressed Downloader',
          value: 'compressedDownloader', 
        },{
          name: 'I/O Adapter',
          value: 'ioAdapter', 
        },{
          name: 'IVR Message Dispatcher Service',
          value: 'ivrMessageDispatcherService', 
        },{
          name: 'Log Files Host',
          value: 'logFilesHost', 
        },{
          name: 'Message Receiver Service',
          value: 'messageReceiverService', 
        },{
          name: 'Repository API Host',
          value: 'repositoryApiHost', 
        },{
          name: 'Service Updater',
          value: 'serviceUpdater', 
        },{
          name: 'Service Updater Host',
          value: 'serviceUpdaterHost', 
        },{
          name: 'Site Downloader Service',
          value: 'siteDownloaderService', 
        },{
          name: 'Site Host',
          value: 'siteHost', 
        }]
      }
    };
  }
  getLogFile() {
    this.logPath = this.selectedLog + this.selectedDay; /* Create log path from name + date */
    this.logs = `Retrieving log file ${this.logPath}...\n`;
    this.$.getLogsAjax.generateRequest();
  }
  handleResponse(e) {
    this.logs += e.detail.response.length === 0 ? 'No Data\n' : `${e.detail.response}\n`;
  }
  handleError(e) {
    this.logs += `Failed to retrieve logs: ${e.detail.error}`;
  }
}

window.customElements.define('log-view', LogView);