// Library
import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import FlipMove from "react-flip-move";

// React Components
import GroupListHeader from "./GroupListHeader";
import GroupListItem from "./GroupListItem";

// APIs
import { GroupsDB } from "../../../api/groups";
import { ProfilesDB } from "../../../api/profiles";
import {
    searchFilterBeforeSet,
    searchFilterBeforeFetch,
    filterItemsByQuery
} from "../../../methods/methods";

const SHOWN_GROUPS_LIMIT = 10;
export class GroupList extends React.Component {
    renderGroupList() {
        return this.props.groups.map(group => {
            return <GroupListItem key={group._id} group={group} />;
        });
    }

    render() {
        return (
            <div className="item-list">
                <GroupListHeader />
                <FlipMove maintainContainerHeight="true">
                    {this.renderGroupList()}
                </FlipMove>
            </div>
        );
    }
}

GroupList.propTypes = {
    groups: PropTypes.array.isRequired,
    session: PropTypes.object.isRequired
};

export default withTracker(() => {
    const selectedGroupId = Session.get("selectedGroupId");
    const searchQuery = Session.get("searchQuery");
    Meteor.subscribe("profiles");
    Meteor.subscribe("dsbjs");

    const groups = fetchGroupsFromDB(selectedGroupId, searchQuery);
    const queriedGroups = filterItemsByQuery(groups, searchQuery);
    return {
        groups: queriedGroups,
        session: Session
    };
})(GroupList);

const fetchGroupsFromDB = (selectedGroupId, query) => {
    let groups = [];
    const userProfile = ProfilesDB.find().fetch()[0];
    const userGroups = userProfile ? userProfile.groups : [];
    if (searchFilterBeforeFetch(query)[0] === "#") {
        groups = GroupsDB.find(
            { isPrivate: false },
            {
                sort: {},
                $limit: SHOWN_GROUPS_LIMIT
            }
        ).fetch();
    } else {
        groups = GroupsDB.find(
            { _id: { $in: userGroups } },
            {
                sort: { lastMessageAt: -1 },
                $limit: SHOWN_GROUPS_LIMIT
            }
        ).fetch();
    }

    groups = groups.map(group => {
        return {
            ...group,
            selected: group._id === selectedGroupId
        };
    });

    return groups;
};
