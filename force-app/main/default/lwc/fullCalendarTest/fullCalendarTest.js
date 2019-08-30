/* eslint-disable no-console */
import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fullCalendar from "@salesforce/resourceUrl/fullCalendar";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";

export default class FullCalendarTest extends LightningElement {

  calendar;

  renderedCallback() {
    if (this.fullCalendarInitialized) {
      return;
    }
    this.fullCalendarInitialized = true;

    Promise.all([
      loadScript(this, fullCalendar + '/packages/core/main.js'),
      loadStyle(this, fullCalendar + '/packages/core/main.css'),
      
    ])
      .then(() => {
        //got to load core first, then plugins
        Promise.all([
          loadScript(this, fullCalendar + '/packages/daygrid/main.js'),
          loadStyle(this, fullCalendar + '/packages/daygrid/main.css'),
          loadScript(this, fullCalendar + '/packages/list/main.js'),
          loadStyle(this, fullCalendar + '/packages/list/main.css'),
          loadScript(this, fullCalendar + '/packages/timegrid/main.js'),
          loadStyle(this, fullCalendar + '/packages/timegrid/main.css'),
        ]).then(() => {
          console.log("init");
          this.init();
        })
        
      })
      .catch(error => {
        console.log("error",error);
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error loading FullCalendar",
            //message: error.message,
            variant: "error"
          })
        );
      });
  }

  init() {
    var calendarEl = this.template.querySelector(".calendar");
    // eslint-disable-next-line no-undef
    this.calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: [ 'dayGrid','timeGrid','list' ],
      views: {
        listDay: { buttonText: 'list day' },
        listWeek: { buttonText: 'list week' },
        listMonth: { buttonText: 'list month' },
        timeGridWeek : {buttonText: 'week time'},
        timeGridDay : {buttonText: 'day time'},
        dayGridMonth : { buttonText: 'month'},
        dayGridWeek : { buttonText: 'week'},
        dayGridDay : {buttonText: 'day'}

      },
  
      header: {
        left: 'title',
        center: '',
        right: 'listDay,listWeek,listMonth,timeGridWeek,timeGridDay,dayGridMonth,dayGridWeek,dayGridDay'
      },
      events: 'https://fullcalendar.io/demo-events.json'
    });

    this.calendar.render();
  }
}
