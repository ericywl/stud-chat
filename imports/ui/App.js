import React from "react";
import ReactDOM from "react-dom";
import { Session } from "meteor/session";
import { Redirect } from "react-router-dom";

import history from "../api/history";
import { getRoutes } from "../routes/routes";
import "../startup/simpl-schema-config";

if (Meteor.isClient) {
    Meteor.startup(() => {
        Session.set("selectedRoomId", undefined);
        Session.set("isNavOpen", false);

        Tracker.autorun(() => {
            const isAuthenticated = !!Meteor.userId();
            const routes = getRoutes(isAuthenticated);

            ReactDOM.render(routes, document.getElementById("render-target"));
        });
    });

    Meteor.subscribe("roomsDB");
}