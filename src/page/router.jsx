import React from "react";
import PropTypes from "prop-types";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

import Home from "./Home";
import MySuccessTrackerDetail from "./MySuccessTrackerDetail";




const RouterPage = ({ pageInfo }) => {
    return (
        <Router basename={pageInfo.basePath}>
            <Switch>
                { <Route exact path="/">
                    <Home />
                </Route> }
                <Route path="/">
    <MySuccessTrackerDetail />
</Route>

               
            </Switch>
        </Router>
    );
};

RouterPage.propTypes = {
    pageInfo: PropTypes.object.isRequired
};

export default RouterPage;
