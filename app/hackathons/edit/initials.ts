
export interface IDataMain {
    title: string;
    description: string;
    location: string;
    total_prizes: string;
    tags: string[];
  }
  
  export interface ITrack {
    icon: string;
    logo: string;
    name: string;
    partner: string;
    description: string;
    short_description: string;
  }
  
  export interface ISchedule {
    url: string;
    date: string;
    name: string;
    category: string;
    location: string;
    description: string;
  }
  
  export interface ISpeaker {
    icon: string;
    name: string;
    category: string;
  }
  
  export interface IResource {
    icon: string;
    link: string;
    title: string;
    description: string;
  }
  
  export interface IDataContent {
    tracks: ITrack[];
    address: string;
    partners: string[];
    schedule: ISchedule[];
    speakers: ISpeaker[];
    resources: IResource[];
    tracks_text: string;
    speakers_text: string;
    join_custom_link: string;
    judging_guidelines: string;
    submission_deadline: string;
    registration_deadline: string;
  }
  
  export interface IDataLatest {
    start_date: string;
    end_date: string;
    timezone: string;
    banner: string;
    participants: string;
  }
  
  export const initialData = {
      main: {
          title: '',
          description: '',
          location: '',
          total_prizes: '',
          tags: [''],
      },
      content: {
          tracks: [
            {
              icon: '',
              logo: '',
              name: '',
              partner: '',
              description: '',
              short_description: '',
            },
          ],
          address: '',
          partners: [''],
          schedule: [
            {
              url: '',
              date: '',
              name: '',
              category: '',
              location: '',
              description: '',
            },
          ],
          speakers: [
            {
              icon: '',
              name: '',
              category: '',
            },
          ],
          resources: [
            {
              icon: '',
              link: '',
              title: '',
              description: '',
            },
          ],
          tracks_text: '',
          speakers_text: '',
          join_custom_link: '',
          judging_guidelines: '',
          submission_deadline: '',
          registration_deadline: '',
      },
      latest: {
          start_date: '',
          end_date: '',
          timezone: '',
          banner: '',
          participants: '',
      }
  }
  