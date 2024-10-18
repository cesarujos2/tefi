interface Issue {
    expand: string;
    id: string;
    self: string;
    key: string;
    fields: Fields;
}

interface Fields {
    statuscategorychangedate: string;
    issuetype: Issuetype;
    timespent: null;
    customfield_10073: null;
    customfield_10074: null;
    project: Project;
    customfield_10110: null;
    fixVersions: any[];
    customfield_10078: null;
    customfield_10111: null;
    aggregatetimespent: null;
    customfield_10035: any[];
    resolution: null;
    customfield_10036: null;
    customfield_10027: null;
    customfield_10028: null;
    customfield_10029: null;
    customfield_10107: null;
    customfield_10108: null;
    customfield_10109: null;
    resolutiondate: null;
    workratio: number;
    watches: Watches;
    issuerestriction: Issuerestriction;
    lastViewed: string;
    customfield_10060: string;
    customfield_10061: null;
    created: string;
    customfield_10062: null;
    customfield_10063: Customfield10063;
    customfield_10020: null;
    customfield_10064: Customfield10063;
    customfield_10065: null;
    customfield_10021: null;
    customfield_10022: null;
    customfield_10066: null;
    customfield_10067: null;
    priority: Priority;
    customfield_10023: null;
    customfield_10068: null;
    customfield_10024: string;
    customfield_10069: any[];
    customfield_10025: null;
    labels: any[];
    customfield_10026: null;
    customfield_10016: null;
    customfield_10017: null;
    customfield_10018: Customfield10018;
    customfield_10019: string;
    aggregatetimeoriginalestimate: null;
    timeestimate: null;
    versions: any[];
    issuelinks: any[];
    assignee: Assignee;
    updated: string;
    status: Status;
    components: any[];
    timeoriginalestimate: null;
    description: Description;
    customfield_10010: Customfield10010;
    customfield_10054: null;
    customfield_10055: null;
    customfield_10056: Customfield10056;
    customfield_10057: null;
    customfield_10014: null;
    customfield_10015: null;
    timetracking: Issuerestrictions;
    customfield_10005: null;
    customfield_10006: null;
    customfield_10007: null;
    security: null;
    customfield_10008: null;
    attachment: any[];
    customfield_10009: null;
    aggregatetimeestimate: null;
    summary: string;
    creator: Creator;
    subtasks: any[];
    reporter: Creator;
    aggregateprogress: Aggregateprogress;
    customfield_10001: null;
    customfield_10002: any[];
    customfield_10003: null;
    customfield_10004: null;
    environment: null;
    duedate: null;
    progress: Aggregateprogress;
    comment: Comment2;
    votes: Votes;
    worklog: Worklog;
}

interface Worklog {
    startAt: number;
    maxResults: number;
    total: number;
    worklogs: any[];
}

interface Votes {
    self: string;
    votes: number;
    hasVoted: boolean;
}

interface Comment2 {
    comments: Comment[];
    self: string;
    maxResults: number;
    total: number;
    startAt: number;
}

interface Comment {
    self: string;
    id: string;
    author: Assignee;
    body: Description;
    updateAuthor: Assignee;
    created: string;
    updated: string;
    jsdPublic: boolean;
}

interface Aggregateprogress {
    progress: number;
    total: number;
}

interface Creator {
    self: string;
    accountId: string;
    avatarUrls: AvatarUrls;
    displayName: string;
    active: boolean;
    timeZone: string;
    accountType: string;
}

interface Customfield10056 {
    languageCode: string;
    displayName: string;
}

interface Customfield10010 {
    _links: Links;
    currentStatus: CurrentStatus;
}

interface CurrentStatus {
    status: string;
    statusCategory: string;
    statusDate: StatusDate;
}

interface StatusDate {
    iso8601: string;
    jira: string;
    friendly: string;
    epochMillis: number;
}

interface Links {
    jiraRest: string;
    web: string;
    self: string;
    agent: string;
}

interface Description {
    type: string;
    version: number;
    content: Content2[];
}

interface Content2 {
    type: string;
    content: Content[];
}

interface Content {
    type: string;
    text: string;
}

interface Status {
    self: string;
    description: string;
    iconUrl: string;
    name: string;
    id: string;
    statusCategory: StatusCategory;
}

interface StatusCategory {
    self: string;
    id: number;
    key: string;
    colorName: string;
    name: string;
}

interface Assignee {
    self: string;
    accountId: string;
    emailAddress: string;
    avatarUrls: AvatarUrls;
    displayName: string;
    active: boolean;
    timeZone: string;
    accountType: string;
}

interface Customfield10018 {
    hasEpicLinkFieldDependency: boolean;
    showField: boolean;
    nonEditableReason: NonEditableReason;
}

interface NonEditableReason {
    reason: string;
    message: string;
}

interface Priority {
    self: string;
    iconUrl: string;
    name: string;
    id: string;
}

interface Customfield10063 {
    errorMessage: string;
    i18nErrorMessage: I18nErrorMessage;
}

interface I18nErrorMessage {
    i18nKey: string;
    parameters: any[];
}

interface Issuerestriction {
    issuerestrictions: Issuerestrictions;
    shouldDisplay: boolean;
}

interface Issuerestrictions {
}

interface Watches {
    self: string;
    watchCount: number;
    isWatching: boolean;
}

interface Project {
    self: string;
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    simplified: boolean;
    avatarUrls: AvatarUrls;
}

interface AvatarUrls {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
}

interface Issuetype {
    self: string;
    id: string;
    description: string;
    iconUrl: string;
    name: string;
    subtask: boolean;
    avatarId: number;
    hierarchyLevel: number;
}