/* eslint-disable no-console */
import { LightningElement, api, track} from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fullCalendar from "@salesforce/resourceUrl/fullCalendar";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import getEventsNearbyDynamic from "@salesforce/apex/FullCalendarController.getEventsNearbyDynamic";
import { NavigationMixin } from 'lightning/navigation';

//global variables
var objectName;
var startField;
var endField;
var colorField;
var additionalFilter;
var allDayField;
var titleField;

export default class FullCalendarComponent extends NavigationMixin(LightningElement) {
  calendar;
  fullCalendarInitialized = false;
  
  @api titleField;
  @api objectName;
  @api startField;
  @api endField;
  @api colorField;
  @api additionalFilter;
  @api aspectRatio;
  @api allDayField;
  @api height;

  @api weekView;
  @api dayView;
  @api listView;

  @track calendarLabel;

  
  connectedCallback() {
    this.addEventListener('fceventclick', this.handleEventClick.bind(this));
    //this.addEventListener('mousewheel', this.handleScroll.bind(this));  
  }

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
          loadStyle(this, fullCalendar + "/packages/timegrid/main.css"),
          loadScript(this, fullCalendar + "/packages/interaction/main.js"),
          loadScript(this, fullCalendar + "/packages/moment/main.js"),
          loadScript(this, fullCalendar + "/packages/moment-timezone/main.js"),
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
      plugins: ["dayGrid", "timeGrid", "list","interaction","moment"],
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
      
      eventClick: info => {
        const selectedEvent = new CustomEvent('fceventclick', { detail: info });
        console.log("eventClick",info);
        this.dispatchEvent(selectedEvent);
      },
      eventMouseEnter: info => {console.log("mouse enter", info)},
      dateClick:info => {console.log("date click", info)},
      header: false,
      /*header: {
        left: "title",
        center: "today prev,next",
        right:
          "listDay,listWeek,listMonth,timeGridWeek,timeGridDay,dayGridMonth,dayGridWeek,dayGridDay"
      },*/
      eventSources: [
        {
          events: this.eventSourceHandler,
          id: "custom"
        },
        //{
        //  events: "https://fullcalendar.io/demo-events.json",
        //  id: "demo"
        //}
      ],
    });
    this.calendar.render();
    this.calendarLabel = this.calendar.view.title;
  }

  nextHandler() {
    this.calendar.next();
    this.calendarLabel = this.calendar.view.title;
  }

  previousHandler() {
    this.calendar.prev();
    this.calendarLabel = this.calendar.view.title;
  }

  dailyViewHandler() {
    this.calendar.changeView(this.dayView);
    this.calendarLabel = this.calendar.view.title;
  }

  weeklyViewHandler() {
    this.calendar.changeView(this.weekView);
    this.calendarLabel = this.calendar.view.title;
  }

  monthlyViewHandler() {
    this.calendar.changeView('dayGridMonth');
    this.calendarLabel = this.calendar.view.title;
  }

  listViewHandler() {
    this.calendar.changeView(this.listView);
    this.calendarLabel = this.calendar.view.title;
  }

  today() {
    this.calendar.today();
    this.calendarLabel = this.calendar.view.title;
  }

  refresh() {
    var eventSource = this.calendar.getEventSourceById('custom');
    eventSource.refetch();
  }

  handleScroll(event) {
    console.log("handleScroll");
    event.stopImmediatePropogation();
  }


  handleEventClick(event) {
    let info = event.detail;
    console.log('Event: ' + info.event.title);
    console.log('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
    console.log('View: ' + info.view.type);
    console.log(info);
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          recordId: info.event.id,
          actionName: 'view',
      },
    });
    // change the border color just for fun
    //info.el.style.borderColor = 'red';

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
