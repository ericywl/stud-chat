// Library
import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";
import moment from "moment";

// APIs
import { GroupsDB } from "./groups";
import { checkUserExist, validateUserDisplayName } from "../misc/methods";
import { ROOM_TEXT_ARR, USERNAME_MIN_LENGTH } from "../misc/constants";

export const ProfilesDB = new Mongo.Collection("profiles");

if (Meteor.isServer) {
    Meteor.publish("profiles", function() {
        if (!this.userId) {
            this.ready();
            throw new Meteor.Error("not-logged-in");
        }

        return ProfilesDB.find(
            {},
            {
                fields: {
                    displayName: 1,
                    groups: 1,
                    tags: 1,
                    bio: 1
                }
            }
        );
    });
}

Meteor.methods({
    profilesJoinGroup(groupId) {
        if (!this.userId) {
            throw new Meteor.Error("not-logged-in");
        }
        checkUserExist(this.userId);

        const group = GroupsDB.findOne({ _id: groupId });
        if (!group)
            throw new Meteor.Error(
                "group-does-not-exist",
                "The group specified does not exist"
            );

        if (group.ownedBy === this.userId) {
            throw new Meteor.Error(
                "already-in-group",
                "You are already the owner of that group"
            );
        }

        if (group.members.includes(this.userId)) {
            throw new Meteor.Error(
                "already-in-group",
                "You are already in that group"
            );
        }

        const profile = ProfilesDB.findOne({ _id: this.userId });
        if (profile.groups.includes(groupId)) {
            throw new Meteor.Error(
                "already-in-group",
                "You are already in that group"
            );
        }

        const result = ProfilesDB.update(
            { _id: this.userId },
            { $push: { groups: groupId } },
            err => {
                if (!err) {
                    try {
                        GroupsDB.update(
                            { _id: groupId },
                            { $addToSet: { members: this.userId } }
                        );
                    } catch (newErr) {
                        throw newErr;
                    }
                }
            }
        );

        return result;
    },

    profilesLeaveGroup(groupId) {
        if (!this.userId) {
            throw new Meteor.Error("not-logged-in");
        }
        checkUserExist(this.userId);

        const group = GroupsDB.findOne({ _id: groupId });
        if (!group)
            throw new Meteor.Error(
                "group-does-not-exist",
                "The group specified does not exist"
            );

        if (group.ownedBy === this.userId)
            throw new Meteor.Error(
                "owner-cannot-leave-group",
                "Owner cannot leave his/her group"
            );

        if (
            !group.members.includes(this.userId) &&
            !group.moderators.includes(this.userId)
        ) {
            throw new Meteor.Error("not-in-group", "You are not in that group");
        }

        const profile = ProfilesDB.findOne({ _id: this.userId });
        if (!profile.groups.includes(groupId)) {
            throw new Meteor.Error("not-in-group", "You are not in that group");
        }

        const result = ProfilesDB.update(
            { _id: this.userId },
            { $pull: { groups: groupId } },
            err => {
                if (!err) {
                    try {
                        GroupsDB.update(
                            { _id: groupId },
                            { $pull: { moderators: this.userId } }
                        );

                        GroupsDB.update(
                            { _id: groupId },
                            { $pull: { members: this.userId } }
                        );
                    } catch (newErr) {
                        throw newErr;
                    }
                }
            }
        );

        return result;
    },

    /**
     * Add a new tag to current user
     * @param {String} _id
     * @param {String} tag
     */
    profilesAddTag(tag) {
        if (!this.userId) {
            throw new Meteor.Error("not-logged-in");
        }

        checkUserExist(this.userId);
        return ProfilesDB.update(
            { _id: this.userId },
            { $addToSet: { tags: tag } }
        );
    },

    profilesRemoveTag(_id, tag) {},

    profilesUpdateDisplayName() {},

    /**
     * Update the bio of the current user
     * @param {String} _id
     * @param {String} newBio
     */
    profilesUpdateBio(newBio) {
        if (!this.userId) {
            throw new Meteor.Error("not-logged-in");
        }

        checkUserExist(this.userId);
        return ProfilesDB.update(
            { _id: this.userId },
            { $set: { bio: newBio } }
        );
    },

    /**
     * Insert new profile, called only on new user creation
     * @param {String} _id
     * @param {String} displayName
     */
    profilesInsert(_id, displayName) {
        validateUserDisplayName(displayName);

        return ProfilesDB.insert({
            _id: _id,
            displayName: displayName,
            groups: [],
            tags: [],
            bio: "",
            createdAt: moment().valueOf()
        });
    }
});
