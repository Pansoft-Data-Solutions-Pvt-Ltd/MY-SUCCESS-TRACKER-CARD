import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import DoubleChevronIcon from '../components/DoubleChevron';

import {
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Card,
    DropdownButtonItem
} from '@ellucian/react-design-system/core';

import {
    spacing10,
    spacing20,
    spacing30,
    spacing40,
    widthFluid
} from '@ellucian/react-design-system/core/styles/tokens';

/* ================= CONFIG ================= */
const TABLE_CONFIG = {
    attendanceGood: 75,
    attendanceWarning: 60,
    lowGrades: ['C1', 'C2', 'D1', 'D2']
};

const PRESENT_TERM = 'Spring 2026';

const COLOR_CONFIG = {
    ON_TRACK: '#34930E',        // Green
    NEEDS_ATTENTION: '#F3C60F', // Yellow
    CRITICAL: '#ED1012'         // Red
};
/* GPA THRESHOLDS */
const GPA_CONFIG = {
    GOOD: 3.5,
    MEDIUM: 3.0
};


/* ================= STYLES ================= */
const styles = {
    root: {
        width: widthFluid,
        margin: spacing30
    },
    topBar: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing40,
        marginBottom: spacing40
    },
    termSection: {
        display: 'flex',
        flexDirection: 'column'
    },
    gpaTopCard: {
        padding: spacing20,
        minWidth: '220px',
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        marginLeft: 'auto'
    },
    gpaLeft: {
        display: 'flex',
        flexDirection: 'column',
        paddingRight: '90px',
        transform: 'translateY(-7px)'
    },
    gpaCircle: {
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        border: '3px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '1rem',
        position: 'absolute',
        right: spacing40,
        top: '50%',
        transform: 'translateY(-50%)'
    },
    gpaDeltaRow: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing10,
        marginTop: spacing10,
        position: 'relative',
        top: '-3px'
    },
    card: {
        padding: spacing20
    },
    legendBar: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing30,
        marginTop: spacing20,
        marginBottom: spacing20
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing10,
        fontSize: '0.85rem'
    },
    legendDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%'
    },
    table: {
        width: '100%',
        tableLayout: 'fixed',
        border: '1px solid #D1D5DB',
        borderCollapse: 'collapse'
    },
    headerCell: {
        backgroundColor: '#026BC8',
        color: '#FFFFFF',
        fontWeight: 600,
        textAlign: 'center',
        height: '48px',
        borderRight: '1px solid #D1D5DB',
        width: '25%'
    },
    bodyCell: {
        textAlign: 'center',
        borderBottom: '1px solid #E5E7EB',
        borderRight: '1px solid #E5E7EB',
        width: '25%'
    },
    lastCell: {
        borderRight: 'none'
    },
    lowGrade: {
        color: COLOR_CONFIG.CRITICAL,
        fontWeight: 600
    },
    progressWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing10,
        justifyContent: 'center'
    },
    progressBar: {
        flexGrow: 1,
        height: '6px',
        borderRadius: '4px',
        backgroundColor: '#E0E0E0',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%'
    },

};

/* ================= COMPONENT ================= */
// ...imports remain the same

class MySuccessTrackerTable extends React.Component {
    state = { currentTerm: 'Fall 2025' };

    gpaByTerm = {
        'Fall 2025': { gpa: 1.45, delta: 0.2 },
        'Summer 2025': { gpa: 3.3, delta: -0.15 },
        'Spring 2025': { gpa: 5.12, delta: 0.42 },
        'Spring 2026': { gpa: 5.48, delta: 0.12 }
    };

    termData = {
        'Fall 2025': [
            { CRN: 'DI234', course: 'Data Science', grade: '--', credit: 3, attendance: 42 },
            { CRN: 'DW234', course: 'Advanced AI', grade: '--', credit: 3, attendance: 68 },
            { CRN: 'KC345', course: 'Capstone Project', grade: '--', credit: 2, attendance: 25 },
            { CRN: 'MN894', course: 'Machine Learning', grade: '--', credit: 3, attendance: 91 }
        ],
        'Summer 2025': [
            { CRN: 'CS101', course: 'Introduction to CS', grade: 'B1', credit: 3, attendance: 65 },
            { CRN: 'MA101', course: 'Calculus I', grade: 'C2', credit: 2, attendance: 48 },
            { CRN: 'EN101', course: 'English Lit', grade: 'A', credit: 2, attendance: 92 }
        ],
        'Spring 2025': [
            { CRN: 'CS201', course: 'Data Structures', grade: 'A2', credit: 4, attendance: 90 },
            { CRN: 'MA201', course: 'Linear Algebra', grade: 'C1', credit: 2, attendance: 45 },
            { CRN: 'PH201', course: 'Physics', grade: 'B1', credit: 3, attendance: 70 }
        ],
        'Spring 2026': [
            { CRN: 'CS301', course: 'Algorithms', grade: 'B2', credit: 3, attendance: 68 },
            { CRN: 'CS302', course: 'Databases', grade: 'A1', credit: 3, attendance: 95 },
            { CRN: 'HS301', course: 'History', grade: 'D1', credit:4,attendance:43}
        ],
    };

    getStatusColor = (value) => {
        if (value >= TABLE_CONFIG.attendanceGood) return COLOR_CONFIG.ON_TRACK;
        if (value >= TABLE_CONFIG.attendanceWarning) return COLOR_CONFIG.NEEDS_ATTENTION;
        return COLOR_CONFIG.CRITICAL;
    };

    getGpaCircleColor = (gpa) => {
        // 0-10 scale
        if (gpa >= 5) return COLOR_CONFIG.ON_TRACK;          // Green
        if (gpa >= 3) return COLOR_CONFIG.NEEDS_ATTENTION;  // Yellow
        if (gpa < 1) return COLOR_CONFIG.CRITICAL;          // Red

        // 0-4 scale fallback
        if (gpa >= GPA_CONFIG.GOOD) return COLOR_CONFIG.ON_TRACK;       // Green
        if (gpa >= GPA_CONFIG.MEDIUM) return COLOR_CONFIG.NEEDS_ATTENTION; // Yellow
        return COLOR_CONFIG.CRITICAL;                                     // Red
    };
    render() {
        const { classes } = this.props;
        const { currentTerm } = this.state;
        const gpaInfo = this.gpaByTerm[currentTerm];
        const isPresentTerm = currentTerm === PRESENT_TERM;
        const isPositive = gpaInfo.delta >= 0;

        const gpaCircleColor = this.getGpaCircleColor(gpaInfo.gpa);
        const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

        return (
            <div className={classes.root}>
                {/* TOP BAR */}
                <div className={classes.topBar}>
                    <div className={classes.termSection}>
                        <Typography variant="h3">Select Term</Typography>
                        <Button
                            dropdown={Object.keys(this.termData).map(term => (
                                <DropdownButtonItem
                                    key={term}
                                    onClick={() => this.setState({ currentTerm: term })}
                                >
                                    {term}
                                </DropdownButtonItem>
                            ))}
                        >
                            {currentTerm}
                        </Button>
                    </div>

                    {/* GPA CARD */}
                    <Card className={classes.gpaTopCard}>
                        <div className={classes.gpaLeft}>
                            <Typography variant="p" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                Cumulative GPA
                            </Typography>

                            {!isPresentTerm && (
                                <div className={classes.gpaDeltaRow}>
                                    <DoubleChevronIcon
                                        orientation={isPositive ? 'up' : 'down'}
                                        size={21}
                                        backgroundColor={deltaColor}
                                        style={{ transform: 'translateY(4px)' }}
                                    />
                                    <Typography style={{ fontWeight: 500, position: 'relative', top: '2px' }}>
                                        <span style={{ color: deltaColor }}>
                                            {Math.abs(gpaInfo.delta)}
                                        </span>
                                        <span style={{ color: '#000000', marginLeft: 3 }}>
                                            From Last Term GPA
                                        </span>
                                    </Typography>

                                </div>
                            )}
                        </div>

                        <div
                            className={classes.gpaCircle}
                            style={{ borderColor: gpaCircleColor, color: gpaCircleColor }}
                        >
                            {gpaInfo.gpa}
                        </div>
                    </Card>
                </div>

                {/* TABLE */}
                <Card className={classes.card}>
                    <Typography variant="h4">
                        Academic Performance – {currentTerm}
                        {currentTerm === 'Spring 2026' && ' (Current Term)'}
                    </Typography>

                    {/* LEGEND */}
                    <div className={classes.legendBar}>
                        <div className={classes.legendItem}>
                            <span className={classes.legendDot} style={{ backgroundColor: COLOR_CONFIG.ON_TRACK }} />
                            On Track
                        </div>
                        <div className={classes.legendItem}>
                            <span className={classes.legendDot} style={{ backgroundColor: COLOR_CONFIG.NEEDS_ATTENTION }} />
                            Needs Attention
                        </div>
                        <div className={classes.legendItem}>
                            <span className={classes.legendDot} style={{ backgroundColor: COLOR_CONFIG.CRITICAL }} />
                            Critical
                        </div>
                    </div>

                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.headerCell}>
                                    <Typography>CRN / Course</Typography>
                                </TableCell>
                                <TableCell className={classes.headerCell}>
                                    <Typography>Grade</Typography>
                                </TableCell>
                                <TableCell className={classes.headerCell}>
                                    <Typography>Credits hours</Typography>
                                </TableCell>
                                <TableCell className={`${classes.headerCell} ${classes.lastCell}`}>
                                    <Typography>Attendance</Typography>
                                </TableCell>
                            </TableRow>

                        </TableHead>
                        <TableBody>
                            {this.termData[currentTerm].map((row, index) => {
                                const attendanceColor = this.getStatusColor(row.attendance);
                                const isLowGrade = TABLE_CONFIG.lowGrades.includes(row.grade);
                                return (
                                    <TableRow key={index}>
                                        <TableCell className={classes.bodyCell}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography style={{ fontWeight: 600 }}>{row.CRN}</Typography>
                                                <Typography variant="caption" style={{ color: '#050505ff' }}>
                                                    {row.course}
                                                </Typography>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`${classes.bodyCell} ${isLowGrade ? classes.lowGrade : ''}`}>
                                            {row.grade === '--' ? '--' : row.grade}
                                        </TableCell>
                                        <TableCell className={classes.bodyCell}>{row.credit}</TableCell>
                                        <TableCell className={`${classes.bodyCell} ${classes.lastCell}`}>
                                            <div className={classes.progressWrapper}>
                                                <div className={classes.progressBar}>
                                                    <div
                                                        className={classes.progressFill}
                                                        style={{ width: `${row.attendance}%`, backgroundColor: attendanceColor }}
                                                    />
                                                </div>
                                                <span style={{ color: attendanceColor, fontWeight: 600 }}>
                                                    {row.attendance}%
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        );
    }
}

MySuccessTrackerTable.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MySuccessTrackerTable);
