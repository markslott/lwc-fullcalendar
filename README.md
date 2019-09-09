# FullCalendar v4 Lightning Web Component

Lightning Web Component example that uses FullCalendar.js version 4.3.1 to display a custom calendar as a LWC within Salesforce.

note, to get fullcalendar to work within a LWC, I did have to make a modification to the core/main.js for fullcalendar to get click and touch events to work properly.

# How to use

If you already haven't, download and install the [Salesforce SFDX command line tool](https://developer.salesforce.com/tools/sfdxcli)

There is only one lightning web component:
fullCalendar

This component is intended to be added to a lightning app page, record page, or home page. However, it can also be embedded in another component as <c-full-calendar ...></c-full-calendar>

refer to the force-app/main/default/lwc/fullCalendar/fullCalendar.js-meta.xml file for properties that need to be included on the compoent to configure it. For example:
<c-full-calendar object-name="Event" title-field="Subject" start-field="StartDateTime" end-field="EndDateTime" all-day-field="IsAllDayEvent"></c-full-calendar>
will configure the component using the standard Salesforce Event object. 
These are also the defaults if you drag the component onto a page layout.

As of right now, click or touch events will navigate to the object that represents the event.
The calendar works on a mobile device, but scrolling is a challenge on the Salesforce mobile app. I may get around to fixing that... and I may not.


## Deploy to Scratch Org
Log into your production Dev Hub org:
```sh
sfdx force:auth:web:login -a devhub -d
```
Create a scratch org an push the component into it
```sh
sfdx force:org:create -f config/project-scratch-def.json -a MyScratchOrg
sfdx force:source:push -u MyScratchOrg
sfdx force:org:open -u MyScratchOrg
```
Navigate to the 'test' tab or add the fullCalendar component to a lightning page to test

## Deploy to Sandbox
```sh
sfdx force:auth:web:login -a MySandbox -r https://test.salesforce.com
sfdx force:source:deploy -m LightningComponentBundle,ApexClass,StaticResource -u MySandbox
```

