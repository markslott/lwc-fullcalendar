public with sharing class FullCalendarController {

    public FullCalendarController() {}

    @AuraEnabled
    public static List<Object> getEventsNearbyDynamic(Date startDate, Date endDate, String objectName, String titleField, String startField, String endField, String colorField, String allDayField, String additionalFilter)  {
        Datetime lastMonth = Datetime.newInstance(startDate.year(),startDate.month(),startDate.day());
        //lastMonth = lastMonth.addMonths(-1);
        String lastMonthStr = lastMonth.formatGmt('yyyy-MM-dd\'T\'hh:mm:ss\'Z\'');
        Datetime nextMonth = Datetime.newInstance(endDate.year(),endDate.month(),endDate.day());
        //nextMonth = nextMonth.addMonths(2).addDays(-1);
        String nextMonthStr = nextMonth.formatGmt('yyyy-MM-dd\'T\'hh:mm:ss\'Z\'');
        String soqlQuery = '';
        if (additionalFilter == null) {
            additionalFilter = '';
        }
        if ((colorField != null) && (colorField != '')) {
            colorField = ','+colorField;
        } else {
            colorField = '';
        }
        if ((allDayField != null) && (allDayField != '')) {
            allDayField = ','+allDayField;
        } else {
            allDayField = '';
        }
        soqlQuery += 'SELECT Id, '+titleField+', '+startField+', '+endField + colorField + allDayField+' FROM ' + objectName;
       
        soqlQuery += ' WHERE (('+startField+' >= '+lastMonthStr+' AND '+startField+' <= '+nextMonthStr+')';
        soqlQuery += ' OR ('+endField+' >= '+lastMonthStr+' AND '+endField+' <= '+nextMonthStr+'))';
        soqlQuery += additionalFilter;
        System.debug('startDate = ' + startDate.format());
        System.debug('endDate = ' + endDate.format());
        System.debug('objectName = ' + objectName);
        System.debug('titleField = ' + titleField);
        System.debug('startField = ' + startField);
        System.debug('endField = ' + endField);
        System.debug('colorField = ' + colorField);
        System.debug(soqlQuery);

        List<Object> q = Database.query(soqlQuery);
        if (q == null) {
            q = new List<Object>();
        }
        System.debug('results = ' + q.size());
        return q;
    }

}
