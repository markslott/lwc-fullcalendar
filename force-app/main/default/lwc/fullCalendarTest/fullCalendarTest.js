/* eslint-disable no-console */
import { LightningElement, api} from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fullCalendar from "@salesforce/resourceUrl/fullCalendar";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import getEventsNearbyDynamic from "@salesforce/apex/FullCalendarController.getEventsNearbyDynamic";

//global variables
var objectName;
var startField;
var endField;
var colorField;
var additionalFilter;
var allDayField;
var titleField;

export default class FullCalendarTest extends LightningElement {
  calendar;
  fullCalendarInitialized = false;
  events;

  @api titleField;
  @api objectName;
  @api startField;
  @api endField;
  @api colorField;
  @api additionalFilter;
  @api aspectRatio;
  @api allDayField;
  @api height;

  renderedCallback() {
    if (this.fullCalendarInitialized) {
      return;
    }
    this.fullCalendarInitialized = true;

    //set global vars
    objectName = this.objectName;
    startField = this.startField;
    endField = this.endField;
    colorField = this.colorField;
    additionalFilter = this.additionalFilter;
    allDayField = this.allDayField;
    titleField = this.titleField;

    Promise.all([
      loadScript(this, fullCalendar + "/packages/core/main.js"),
      loadStyle(this, fullCalendar + "/packages/core/main.css")
    ])
      .then(() => {
        //got to load core first, then plugins
        Promise.all([
          loadScript(this, fullCalendar + "/packages/daygrid/main.js"),
          loadStyle(this, fullCalendar + "/packages/daygrid/main.css"),
          loadScript(this, fullCalendar + "/packages/list/main.js"),
          loadStyle(this, fullCalendar + "/packages/list/main.css"),
          loadScript(this, fullCalendar + "/packages/timegrid/main.js"),
          loadStyle(this, fullCalendar + "/packages/timegrid/main.css")
        ]).then(() => {
          console.log("init");
          this.init();
        });
      })
      .catch(error => {
        console.log("error", error);
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
      plugins: ["dayGrid", "timeGrid", "list"],
      views: {
        listDay: { buttonText: "list day" },
        listWeek: { buttonText: "list week" },
        listMonth: { buttonText: "list month" },
        timeGridWeek: { buttonText: "week time" },
        timeGridDay: { buttonText: "day time" },
        dayGridMonth: { buttonText: "month" },
        dayGridWeek: { buttonText: "week" },
        dayGridDay: { buttonText: "day" }
      },

      header: {
        left: "title",
        center: "today prev,next",
        right:
          "listDay,listWeek,listMonth,timeGridWeek,timeGridDay,dayGridMonth,dayGridWeek,dayGridDay"
      },

      eventSources: [
        {
          events: this.eventSourceHandler,
          id: "custom"
        },
        {
          events: "https://fullcalendar.io/demo-events.json",
          id: "demo"
        }
      ]
    });

    this.calendar.render();
  }

  eventSourceHandler(info, successCallback, failureCallback) {
    getEventsNearbyDynamic({
      startDate: info.start,
      endDate: info.end,
      objectName: objectName,
      titleField: titleField,
      startField: startField,
      endField: endField,
      colorField: colorField,
      allDayField: allDayField,
      additionalFilter: additionalFilter
    })
      .then(result => {
        if (result) {
          let events = result;
          let e = [];
          for (let event in events) {
            if (event) {
              e.push({
                title: events[event][titleField],
                start: events[event][startField],
                end: events[event][endField],
                Id: events[event].Id,
                id: events[event].Id,
                color: events[event][colorField],
                allDay: events[event][allDayField]
              });
            }
          }
          console.log("num events = ",e.length);
          successCallback(e);
        }
      })
      .catch(error => {
        console.error("error calling apex controller:",error);
        failureCallback(error);
      });
  }
}
