import mongoose from "mongoose";
import { Document } from 'mongoose'

export interface IEvent extends Document {
    _id: string;
    title: string;
    description?: string;
    location: string;
    eventLatitude: string,
    eventLongitude: string,
    createdAt: Date;
    imageUrl: string;
    date: Date;
    price: string;
    isFree: boolean;
    url?: string;
    category: { _id: string, name: string }
    organizer: { _id: string, firstName: string, lastName: string }
    isVirtual: boolean;
    meetingUrl?: string;
    meetingId?: string;
    meetingPassword?: string;
}

// schema
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
    eventLatitude: {
        type: String
    },
    eventLongitude: {
        type: String
    },
    imageUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: Date.now
    },
    price: {
        type: String
    },
    isFree: {
        type: Boolean
    },
    url: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isVirtual: {
        type: Boolean,
        default: false
    },
    meetingUrl: {
        type: String
    },
    meetingId: {
        type: String
    },
    meetingPassword: {
        type: String
    }
})

const Event = mongoose.models?.Event || mongoose.model('Event', eventSchema)

export default Event