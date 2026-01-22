module.exports = {
    name: 'My Success Tracker',
    publisher: 'Sample',
    cards: [{
        type: 'My Success Tracker',
        source: './src/cards/MySuccessTrackerCard',
        title: 'My Success Tracker',
        displayCardType: 'My Success Tracker Card',
        description: 'This is an introductory card to the Ellucian Experience SDK',
        configuration: {
            client: [{
                key: 'goodAttendanceColorCode',
                label: 'Hex color code for good attendance',
                type: 'text',
                required: false
            },
            {
                key: 'decentAttendanceColorCode',
                label: 'Hex color code for decent attendance',
                type: 'text',
                required: false
            },            
            {
                key: 'poorAttendanceColorCode',
                label: 'Hex color code for bad attendance',
                type: 'text',
                required: false
            },            
            {
                key: 'gpaIncreaseChevronColorCode',
                label: 'Hex color code for chevron when GPA has increased',
                type: 'text',
                required: false
            },            
            {
                key: 'gpaDecreaseChevronColorCode',
                label: 'Hex color code for chevron when GPA has decreased',
                type: 'text',
                required: false
            },            
            {
                key: 'gpaCircleColorCode',
                label: 'Hex color code for the GPA circle',
                type: 'text',
                required: false
            }],
            server: [{
                key: 'ethosApiKey',
                label: 'Ethos API Key',
                type: 'password',
                require: true,
                default:''
            }]
        },
        pageRoute: {
            route: '/',
            excludeClickSelectors: ['a']
        }
    }],
    page: {
        source: './src/page/router.jsx'
    }
};