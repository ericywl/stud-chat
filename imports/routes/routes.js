import React from "react";
import { Redirect, Router, Route, Switch } from "react-router-dom";

import history from "../startup/history";
import Dashboard from "../ui/app/Dashboard";
import Login from "../ui/auth/Login";
import Signup from "../ui/auth/Signup";
import NotFound from "../ui/NotFound";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

export const getRoutes = isAuthenticated => {
    return (
        <Router history={history}>
            <div>
                <Switch>
                    <PublicRoute
                        exact
                        path="/"
                        isAuth={isAuthenticated}
                        component={Login}
                    />

                    <PublicRoute
                        path="/signup"
                        isAuth={isAuthenticated}
                        component={Signup}
                    />

                    <PrivateRoute
                        exact
                        path="/dashboard"
                        isAuth={isAuthenticated}
                        component={Dashboard}
                    />
<<<<<<< HEAD

                    <PrivateRoute
                        path="/dashboard/:id"
                        isAuth={isAuthenticated}
                        component={Dashboard}
                    />
					
					<PrivateRoute
                    	path="/finder"
                    	isAuth={isAuthenticated}
                    	component={Dashboard}
					/>
=======
>>>>>>> 8de3f2d07066a730976e98e6dfbc2bbf2cdfdf87
					
                    <Route component={NotFound} />
                </Switch>
            </div>
        </Router>
    );
};
