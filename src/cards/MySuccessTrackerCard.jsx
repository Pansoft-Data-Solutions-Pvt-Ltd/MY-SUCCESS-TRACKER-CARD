import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing24 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    Table,
    TableRow,
    TableCell,
    TableBody,
} from '@ellucian/react-design-system/core';
import { useCardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import { data } from '../util/data.js';
//import arrow from '../../assets/arrow.png';
import React from 'react';
import SvgHollowCircle from '../components/SvgHollowCircle.jsx';
import DoubleChevronIcon from '../components/DoubleChevron.jsx';

 
const styles = (theme) => ({
    card: {
        padding: '0 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing24,
        overflow: 'hidden',
        width: '100%'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #e0e0e0',
        margin: '1rem 0'
    },
    cardBody: {
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
 
        [theme.breakpoints.down('md')]: {
            flexDirection: 'column'
        }
    },
    gpaSection: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        // justifyContent: 'center'
        [theme.breakpoints.down('md')]: {
            alignItems: 'center'
        }
    },
    attendanceSection: {
        flex: 2,
        minWidth: 0,
    },
    gpaHeader: {
 
    },
    gpaBody: {
        display: 'flex',
        gap: '1.25rem',
        // alignItems: 'center',
        flexDirection: 'column'
    },
    gpaMessage: {
 
    },
    gpaCircleContainer: {
        flexShrink: 0,
        flex: 1,
        display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center'
    },
    gpaCircleInner: {
        width: 'clamp(4rem, 10rem, 5rem)',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid #006114'
    },
    gpaDelta: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    verticalDivider: {
        display: 'none',
        [theme.breakpoints.down('md')]: {
            display: 'block',
            padding: '1rem'
        }
    },
    attendanceHeader: {
 
    },
    attendanceTable: {
 
    },
    iconText: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    icon: {
        width: '1rem',
        height: '1rem'
    }
});
 
const MySuccessTrackerCard = ({ classes }) => {
    const { configuration: { goodAttendanceColorCode, decentAttendanceColorCode, poorAttendanceColorCode, gpaIncreaseChevronColorCode, gpaDecreaseChevronColorCode, gpaCircleColorCode } = {} } = useCardInfo();
 
    return (
        <div className={classes.card}>
            <div className={classes.cardBody}>
                <section className={classes.gpaSection}>
                    <header className={classes.gpaHeader}>
                        <Typography variant="h4">Cumulative GPA</Typography>
                    </header>
                    <div className={classes.gpaBody}>
                        <div className={classes.gpaCircleContainer}>
                            <div className={classes.gpaCircleInner} style={{border: `4px solid ${gpaCircleColorCode ?? '#006114'}`}}>
                                <strong>{data.currentGPA}</strong>
                            </div>
                        </div>
                        <div className={classes.gpaDelta}>
                            <div className={classes.iconText}>
                                {/* <img src={arrow} alt="" className={classes.icon} /> */}
                                <DoubleChevronIcon backgroundColor={data.gpaDelta >= 0 ? gpaIncreaseChevronColorCode ?? '#006114' : gpaDecreaseChevronColorCode ?? '#F20A0A'} orientation={data.gpaDelta >= 0 ? 'up' : 'down'} size='1rem' />
                                <strong style={{ fontSize: '1rem' }}>{data.gpaDelta}</strong>
                            </div>
                            <Typography variant='p' style={{ fontSize: '0.6rem' }} className={classes.deltaText}> from last term</Typography>
                        </div>
                    </div>
                    <div className={classes.gpaMessage}>
                        Congratulations GPA improved
                    </div>
                </section>
                {/* {<Divider className={classes.verticalDivider} />} */}
                <section className={classes.attendanceSection}>
                    <header className={classes.attendanceHeader}>
                        <Typography variant="h4" style={{ textAlign: 'center' }}>Attendance Overview</Typography>
                        <Typography variant="h6" style={{ textAlign: 'center' }}>Fall 2025</Typography>
                    </header>
                    <Table className={classes.attendanceTable}>
                        <TableBody>
                            {data.attendance.map((at) => {
                                return <TableRow key={at.courseName}>
                                    <TableCell style={{ fontSize: '0.8rem' }}>
                                        <strong>{at.courseName}</strong>
                                    </TableCell>
                                    <TableCell>
                                        <span style={{ fontSize: '0.8rem' }} className={classes.iconText}>
                                            <strong>{at.percentage + "%"}</strong>
                                            <SvgHollowCircle color={
                                                at.percentage < 40
                                                    ? poorAttendanceColorCode ?? '#F20A0A'
                                                    : at.percentage < 75
                                                        ? decentAttendanceColorCode ?? '#F27A0A'
                                                        : goodAttendanceColorCode ?? '#006114'
                                            } />
                                        </span>
                                    </TableCell>
                                </TableRow>
                            })}
                        </TableBody>
                    </Table>
                </section>
            </div>
        </div>
    );
};
 
MySuccessTrackerCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MySuccessTrackerCard);