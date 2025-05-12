'use client';

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash, ChevronDown, ChevronRight } from 'lucide-react';

const HackathonsEdit = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    total_prizes: '',
    tags: [''],
    start_date: '',
    end_date: '',
    timezone: '',
    banner: '',
    participants: '',
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
  });

  const [removing, setRemoving] = useState<{ [key: string]: number | null }>({});
  const [collapsed, setCollapsed] = useState({
    main: false,
    content: false,
    last: false,
  });

  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [error, setError] = useState<{ field: string, message: string } | null>(null);

  const [collapsedTracks, setCollapsedTracks] = useState<boolean[]>(formData.content.tracks.map(() => false));

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Show toast when error changes
  React.useEffect(() => {
    if (error && error.message) {
      setShowToast(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setShowToast(false), 4000);
    }
  }, [error]);

  React.useEffect(() => {
    setCollapsedTracks((prev) => {
      if (formData.content.tracks.length > prev.length) {
        return [...prev, ...Array(formData.content.tracks.length - prev.length).fill(false)];
      } else if (formData.content.tracks.length < prev.length) {
        return prev.slice(0, formData.content.tracks.length);
      }
      return prev;
    });
  }, [formData.content.tracks.length]);

  // Estado de colapso individual para schedule, speakers y resources
  const [collapsedSchedules, setCollapsedSchedules] = useState<boolean[]>(formData.content.schedule.map(() => false));
  const [collapsedSpeakers, setCollapsedSpeakers] = useState<boolean[]>(formData.content.speakers.map(() => false));
  const [collapsedResources, setCollapsedResources] = useState<boolean[]>(formData.content.resources.map(() => false));

  // Sincroniza el estado de colapso si cambia la cantidad
  React.useEffect(() => {
    setCollapsedSchedules((prev) => {
      if (formData.content.schedule.length > prev.length) {
        return [...prev, ...Array(formData.content.schedule.length - prev.length).fill(false)];
      } else if (formData.content.schedule.length < prev.length) {
        return prev.slice(0, formData.content.schedule.length);
      }
      return prev;
    });
  }, [formData.content.schedule.length]);
  React.useEffect(() => {
    setCollapsedSpeakers((prev) => {
      if (formData.content.speakers.length > prev.length) {
        return [...prev, ...Array(formData.content.speakers.length - prev.length).fill(false)];
      } else if (formData.content.speakers.length < prev.length) {
        return prev.slice(0, formData.content.speakers.length);
      }
      return prev;
    });
  }, [formData.content.speakers.length]);
  React.useEffect(() => {
    setCollapsedResources((prev) => {
      if (formData.content.resources.length > prev.length) {
        return [...prev, ...Array(formData.content.resources.length - prev.length).fill(false)];
      } else if (formData.content.resources.length < prev.length) {
        return prev.slice(0, formData.content.resources.length);
      }
      return prev;
    });
  }, [formData.content.resources.length]);

  const t = {
    en: {
      mainTopics: 'Main topics',
      mainTopicsCompleted: 'Main topics completed',
      content: 'Content',
      contentCompleted: 'Content completed',
      lastDetails: 'Last details',
      lastDetailsCompleted: 'Last details completed',
      done: 'Done',
      expand: 'Expand',
      editHackathons: 'Edit Hackathons',
      addNewHackathon: 'Add new hackathon',
      cancel: 'Cancel',
      mainName: 'Main name of the hackathon',
      description: 'Description of the hackathon',
      city: 'City of the hackathon',
      totalPrizes: 'Total prizes',
      tags: 'Tags',
      tagsHelp: 'Categories to be evaluated in the hackathon',
      tracks: 'Tracks',
      selectIcon: 'Select an icon for the track',
      selectLogo: 'Select a logo for the track',
      trackName: 'Type the name of the track',
      trackPartner: 'Type the name of the partner sponsoring this track',
      trackDescription: 'Type a detailed description of the track. You can use HTML tags like <b></b>, <a href=""></a>, etc.',
      shortDescription: 'Short description of the track',
      addTrack: 'Add Track',
      address: 'Address',
      addressHelp: 'Detailed address of the hackathon within the city',
      partners: 'Partners',
      partnersHelp: 'Type the partners of the hackathon',
      schedule: 'Schedule',
      scheduleHelp: 'Hackathon agendas like Team Formation, Workshop: Mastering Avalanche, etc.',
      scheduleDate: 'Date of the scheduled activity',
      scheduleName: 'Name of the scheduled activity',
      scheduleCategory: 'Category of the scheduled activity',
      scheduleLocation: 'Location of the activity, e.g. Auditorium, Study Room, etc.',
      scheduleDescription: 'Description of the scheduled activity',
      addSchedule: 'Add Schedule',
      speakers: 'Speakers',
      speakerIcon: 'Select an icon for the speaker',
      speakerName: 'Type the name of the speaker',
      speakerCompany: 'Type the company the speaker represents',
      addSpeaker: 'Add Speaker',
      resources: 'Resources',
      resourceIcon: 'Select an icon for the resource',
      resourceLink: 'Type the link of the resource',
      resourceTitle: 'Type the title of the resource',
      resourceDescription: 'Type the description of the resource',
      addResource: 'Add Resource',
      trackText: 'Track Text',
      trackTextHelp: 'Type the text field to be shown for tracks',
      speakerText: 'Speaker Text',
      speakerTextHelp: 'Type the text field to be shown for speakers',
      joinCustomLink: 'Join Custom Link',
      joinCustomLinkHelp: 'Type the registration link for the hackathon',
      judgingGuidelines: 'Judging Guidelines',
      judgingGuidelinesHelp: 'Type the judging guidelines. Note: You can use tags like <h3></h3>, /n, etc.',
      submissionDeadline: 'Deadline project submission',
      submissionDeadlineHelp: 'Select the deadline for project submission',
      registrationDeadline: 'Deadline hackathon registration',
      registrationDeadlineHelp: 'Select the deadline for hackathon registration',
      startDate: 'Start Date',
      startDateHelp: 'Select the start date of the hackathon',
      endDate: 'End Date',
      endDateHelp: 'Select the end date of the hackathon',
      timezone: 'Timezone',
      timezoneHelp: 'Type the timezone where the hackathon will take place, e.g. Europe/London',
      banner: 'Banner',
      bannerHelp: 'Type the URL of the image to be used as the banner',
      participants: 'Participants',
      participantsHelp: 'Type the maximum number of allowed participants',
      submit: 'Submit',
      removeTrack: 'Remove track',
      removeSchedule: 'Remove schedule',
      removeSpeaker: 'Remove speaker',
      removeResource: 'Remove resource',
      switchToSpanish: 'Switch to Spanish',
      switchToEnglish: 'Switch to English',
      requiredFieldsError: 'Please fill in all required fields before continuing.',
    },
    es: {
      mainTopics: 'Temas principales',
      mainTopicsCompleted: 'Temas principales completados',
      content: 'Contenido',
      contentCompleted: 'Contenido completado',
      lastDetails: 'Últimos detalles',
      lastDetailsCompleted: 'Últimos detalles completados',
      done: 'Listo',
      expand: 'Expandir',
      editHackathons: 'Editar Hackathons',
      addNewHackathon: 'Agregar nuevo hackathon',
      cancel: 'Cancelar',
      mainName: 'Nombre principal del hackathon',
      description: 'Descripción del hackathon',
      city: 'Ciudad del hackathon',
      totalPrizes: 'Premios totales',
      tags: 'Etiquetas',
      tagsHelp: 'Categorías a evaluar en el hackathon',
      tracks: 'Tracks',
      selectIcon: 'Selecciona un ícono para el track',
      selectLogo: 'Selecciona un logo para el track',
      trackName: 'Escribe el nombre del track',
      trackPartner: 'Escribe el nombre del patrocinador de este track',
      trackDescription: 'Escribe una descripción detallada del track. Puedes usar etiquetas HTML como <b></b>, <a href=""></a>, etc.',
      shortDescription: 'Descripción corta del track',
      addTrack: 'Agregar Track',
      address: 'Dirección',
      addressHelp: 'Dirección detallada del hackathon dentro de la ciudad',
      partners: 'Patrocinadores',
      partnersHelp: 'Escribe los patrocinadores del hackathon',
      schedule: 'Agenda',
      scheduleHelp: 'Agendas del hackathon como Formación de Equipos, Taller: Dominando Avalanche, etc.',
      scheduleDate: 'Fecha de la actividad programada',
      scheduleName: 'Nombre de la actividad programada',
      scheduleCategory: 'Categoría de la actividad programada',
      scheduleLocation: 'Ubicación de la actividad, ej. Auditorio, Sala de Estudio, etc.',
      scheduleDescription: 'Descripción de la actividad programada',
      addSchedule: 'Agregar Agenda',
      speakers: 'Ponentes',
      speakerIcon: 'Selecciona un ícono para el ponente',
      speakerName: 'Escribe el nombre del ponente',
      speakerCompany: 'Escribe la empresa que representa el ponente',
      addSpeaker: 'Agregar Ponente',
      resources: 'Recursos',
      resourceIcon: 'Selecciona un ícono para el recurso',
      resourceLink: 'Escribe el enlace del recurso',
      resourceTitle: 'Escribe el título del recurso',
      resourceDescription: 'Escribe la descripción del recurso',
      addResource: 'Agregar Recurso',
      trackText: 'Texto de Tracks',
      trackTextHelp: 'Escribe el texto a mostrar para los tracks',
      speakerText: 'Texto de Ponentes',
      speakerTextHelp: 'Escribe el texto a mostrar para los ponentes',
      joinCustomLink: 'Enlace de Registro',
      joinCustomLinkHelp: 'Escribe el enlace de registro para el hackathon',
      judgingGuidelines: 'Criterios de Evaluación',
      judgingGuidelinesHelp: 'Escribe los criterios de evaluación. Nota: Puedes usar etiquetas como <h3></h3>, /n, etc.',
      submissionDeadline: 'Fecha límite de entrega de proyectos',
      submissionDeadlineHelp: 'Selecciona la fecha límite para la entrega de proyectos',
      registrationDeadline: 'Fecha límite de registro al hackathon',
      registrationDeadlineHelp: 'Selecciona la fecha límite para el registro al hackathon',
      startDate: 'Fecha de Inicio',
      startDateHelp: 'Selecciona la fecha de inicio del hackathon',
      endDate: 'Fecha de Fin',
      endDateHelp: 'Selecciona la fecha de fin del hackathon',
      timezone: 'Zona Horaria',
      timezoneHelp: 'Escribe la zona horaria donde se realizará el hackathon, ej. Europe/London',
      banner: 'Banner',
      bannerHelp: 'Escribe la URL de la imagen a usar como banner',
      participants: 'Participantes',
      participantsHelp: 'Escribe el número máximo de participantes permitidos',
      submit: 'Enviar',
      removeTrack: 'Eliminar track',
      removeSchedule: 'Eliminar agenda',
      removeSpeaker: 'Eliminar ponente',
      removeResource: 'Eliminar recurso',
      switchToSpanish: 'Cambiar a español',
      switchToEnglish: 'Cambiar a inglés',
      requiredFieldsError: 'Por favor complete todos los campos requeridos antes de continuar.',
    }
  };

  let refs = {
    title: useRef<HTMLInputElement>(null),
    description: useRef<HTMLInputElement>(null),
    location: useRef<HTMLInputElement>(null),
    total_prizes: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
    tracks_text: useRef<HTMLInputElement>(null),
    speakers_text: useRef<HTMLInputElement>(null),
    join_custom_link: useRef<HTMLInputElement>(null),
    judging_guidelines: useRef<HTMLInputElement>(null),
    submission_deadline: useRef<HTMLInputElement>(null),
    registration_deadline: useRef<HTMLInputElement>(null),
    start_date: useRef<HTMLInputElement>(null),
    end_date: useRef<HTMLInputElement>(null),
    timezone: useRef<HTMLInputElement>(null),
    banner: useRef<HTMLInputElement>(null),
    participants: useRef<HTMLInputElement>(null),
    tags: useRef<HTMLInputElement>(null),
    tracks: useRef<{ [key: string]: React.RefObject<any> }[]>([]),
    partners: useRef<React.RefObject<HTMLInputElement>[]>([]),
    schedule: useRef<{ [key: string]: React.RefObject<any> }[]>([]),
    speakers: useRef<{ [key: string]: React.RefObject<any> }[]>([]),
    resources: useRef<{ [key: string]: React.RefObject<any> }[]>([]),
  };

  while (refs.tracks.current.length < formData.content.tracks.length) refs.tracks.current.push({
    icon: React.createRef(),
    logo: React.createRef(),
    name: React.createRef(),
    partner: React.createRef(),
    description: React.createRef(),
    short_description: React.createRef(),
  });
  while (refs.partners.current.length < formData.content.partners.length) refs.partners.current.push(React.createRef<HTMLInputElement>());
  while (refs.schedule.current.length < formData.content.schedule.length) refs.schedule.current.push({
    date: React.createRef(),
    name: React.createRef(),
    location: React.createRef(),
    description: React.createRef(),
  });
  while (refs.speakers.current.length < formData.content.speakers.length) refs.speakers.current.push({
    name: React.createRef(),
    category: React.createRef(),
  });
  while (refs.resources.current.length < formData.content.resources.length) refs.resources.current.push({
    link: React.createRef(),
    title: React.createRef(),
    description: React.createRef(),
  });

  const fieldLabels: { [key: string]: string } = {
    title: t[language].mainName,
    description: t[language].description,
    location: t[language].city,
    total_prizes: t[language].totalPrizes,
    address: t[language].address,
  };

  const trackFieldLabels: { [key: string]: string } = {
    icon: t[language].selectIcon,
    logo: t[language].selectLogo,
    name: t[language].trackName,
    partner: t[language].trackPartner,
    description: t[language].trackDescription,
    short_description: t[language].shortDescription,
  };

  const scheduleFieldLabels: { [key: string]: string } = {
    date: t[language].scheduleDate,
    name: t[language].scheduleName,
    location: t[language].scheduleLocation,
    description: t[language].scheduleDescription,
  };
  const speakerFieldLabels: { [key: string]: string } = {
    name: t[language].speakerName,
    category: t[language].speakerCompany,
  };
  const resourceFieldLabels: { [key: string]: string } = {
    link: t[language].resourceLink,
    title: t[language].resourceTitle,
    description: t[language].resourceDescription,
  };

  // Validación individual
  const validateSingleSchedule = (event: any, idx: number) => {
    for (const field of ['date', 'name', 'location', 'description']) {
      if (!event[field]) {
        const label = scheduleFieldLabels[field] || field;
        setError({ field: `schedule-${idx}-${field}`, message: language === 'es' ? `Por favor llene el campo "${label}" de la agenda ${idx + 1}.` : `Please fill in the "${label}" field for schedule ${idx + 1}.` });
        setTimeout(() => (refs.schedule.current[idx] as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
        return false;
      }
    }
    setError(null);
    return true;
  };
  const validateSingleSpeaker = (speaker: any, idx: number) => {
    for (const field of ['name', 'category']) {
      if (!speaker[field]) {
        const label = speakerFieldLabels[field] || field;
        setError({ field: `speaker-${idx}-${field}`, message: language === 'es' ? `Por favor llene el campo "${label}" del ponente ${idx + 1}.` : `Please fill in the "${label}" field for speaker ${idx + 1}.` });
        setTimeout(() => (refs.speakers.current[idx] as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
        return false;
      }
    }
    setError(null);
    return true;
  };
  const validateSingleResource = (resource: any, idx: number) => {
    for (const field of ['link', 'title', 'description']) {
      if (!resource[field]) {
        const label = resourceFieldLabels[field] || field;
        setError({ field: `resource-${idx}-${field}`, message: language === 'es' ? `Por favor llene el campo "${label}" del recurso ${idx + 1}.` : `Please fill in the "${label}" field for resource ${idx + 1}.` });
        setTimeout(() => (refs.resources.current[idx] as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
        return false;
      }
    }
    setError(null);
    return true;
  };

  // Handlers Done/Expand
  const handleScheduleDone = (idx: number) => {
    const valid = validateSingleSchedule(formData.content.schedule[idx], idx);
    if (valid) setCollapsedSchedules((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };
  const handleScheduleExpand = (idx: number) => {
    setCollapsedSchedules((prev) => prev.map((v, i) => (i === idx ? false : v)));
  };
  const handleSpeakerDone = (idx: number) => {
    const valid = validateSingleSpeaker(formData.content.speakers[idx], idx);
    if (valid) setCollapsedSpeakers((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };
  const handleSpeakerExpand = (idx: number) => {
    setCollapsedSpeakers((prev) => prev.map((v, i) => (i === idx ? false : v)));
  };
  const handleResourceDone = (idx: number) => {
    const valid = validateSingleResource(formData.content.resources[idx], idx);
    if (valid) setCollapsedResources((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };
  const handleResourceExpand = (idx: number) => {
    setCollapsedResources((prev) => prev.map((v, i) => (i === idx ? false : v)));
  };

  const getErrorMessage = (field: string) => {
    return language === 'es'
      ? `Por favor llene el campo "${fieldLabels[field] ?? field}".`
      : `Please fill in the "${fieldLabels[field] ?? field}" field.`;
  };

  const animateRemove = (type: string, index: number, removeFn: (i: number) => void) => {
    setRemoving((prev) => ({ ...prev, [`${type}-${index}`]: Date.now() }));
    setTimeout(() => {
      removeFn(index);
      setRemoving((prev) => ({ ...prev, [`${type}-${index}`]: null }));
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] });
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const handlePartnerInputChange = (index: number, value: string) => {
    const newPartners = [...formData.content.partners];
    newPartners[index] = value;
    setFormData({
      ...formData,
      content: { ...formData.content, partners: newPartners },
    });
  };

  const addPartner = () => {
    setFormData({
      ...formData,
      content: { ...formData.content, partners: [...formData.content.partners, ''] },
    });
  };

  const removePartner = (index: number) => {
    const newPartners = formData.content.partners.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      content: { ...formData.content, partners: newPartners },
    });
  };

  const handleTrackChange = (index: number, field: string, value: string) => {
    const newTracks = [...formData.content.tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setFormData({
      ...formData,
      content: { ...formData.content, tracks: newTracks },
    });
  };

  const addTrack = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        tracks: [
          ...formData.content.tracks,
          {
            icon: '',
            logo: '',
            name: '',
            partner: '',
            description: '',
            short_description: '',
          },
        ],
      },
    });
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedule = [...formData.content.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({
      ...formData,
      content: { ...formData.content, schedule: newSchedule },
    });
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        schedule: [
          ...formData.content.schedule,
          {
            url: '',
            date: '',
            name: '',
            category: '',
            location: '',
            description: '',
          },
        ],
      },
    });
  };

  const handleSpeakerChange = (index: number, field: string, value: string) => {
    const newSpeakers = [...formData.content.speakers];
    newSpeakers[index] = { ...newSpeakers[index], [field]: value };
    setFormData({
      ...formData,
      content: { ...formData.content, speakers: newSpeakers },
    });
  };

  const addSpeaker = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        speakers: [
          ...formData.content.speakers,
          { icon: '', name: '', category: '' },
        ],
      },
    });
  };

  const handleResourceChange = (index: number, field: string, value: string) => {
    const newResources = [...formData.content.resources];
    newResources[index] = { ...newResources[index], [field]: value };
    setFormData({
      ...formData,
      content: { ...formData.content, resources: newResources },
    });
  };

  const addResource = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        resources: [
          ...formData.content.resources,
          { icon: '', link: '', title: '', description: '' },
        ],
      },
    });
  };

  const removeTrack = (index: number) => {
    if (formData.content.tracks.length > 1) {
      const newTracks = formData.content.tracks.filter((_, i) => i !== index);
      setFormData({ ...formData, content: { ...formData.content, tracks: newTracks } });
    }
  };

  const removeSchedule = (index: number) => {
    if (formData.content.schedule.length > 1) {
      const newSchedule = formData.content.schedule.filter((_, i) => i !== index);
      setFormData({ ...formData, content: { ...formData.content, schedule: newSchedule } });
    }
  };

  const removeSpeaker = (index: number) => {
    if (formData.content.speakers.length > 1) {
      const newSpeakers = formData.content.speakers.filter((_, i) => i !== index);
      setFormData({ ...formData, content: { ...formData.content, speakers: newSpeakers } });
    }
  };

  const removeResource = (index: number) => {
    if (formData.content.resources.length > 1) {
      const newResources = formData.content.resources.filter((_, i) => i !== index);
      setFormData({ ...formData, content: { ...formData.content, resources: newResources } });
    }
  };

  const validateMainSection = () => {
    if (!formData.title) {
      setError({ field: 'title', message: getErrorMessage('title') });
      setTimeout(() => refs.title.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return false;
    }
    if (!formData.description) {
      setError({ field: 'description', message: getErrorMessage('description') });
      setTimeout(() => refs.description.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return false;
    }
    if (!formData.location) {
      setError({ field: 'location', message: getErrorMessage('location') });
      setTimeout(() => refs.location.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return false;
    }
    if (!formData.total_prizes) {
      setError({ field: 'total_prizes', message: getErrorMessage('total_prizes') });
      setTimeout(() => refs.total_prizes.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return false;
    }
    for (let i = 0; i < formData.tags.length; i++) {
      if (!formData.tags[i]) {
        setError({ field: `tag-${i}`, message: language === 'es' ? 'Por favor llene todas las etiquetas.' : 'Please fill in all tags.' });
        setTimeout(() => refs.tags.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const validateContentSection = () => {
    const content = formData.content;
    for (let i = 0; i < content.tracks.length; i++) {
      const track = content.tracks[i];
      console.log({track});
      for (const field of ['icon', 'logo', 'name', 'partner', 'description', 'short_description']) {
        if (!(track as any)[field]) {
        console.log({field, refs, refUsed: refs.tracks.current[i][field]});
          setError({ field: `track-${i}-${field}`, message: language === 'es' ? `Por favor llene el campo ${(t[language] as any)[field] || field} del track ${i + 1}.` : `Please fill in the ${(t[language] as any)[field] || field} field for track ${i + 1}.` });
          setTimeout(() => (refs.tracks.current[i] as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
          return false;
        }
      }
    }
    if (!content.address) {
      setError({ field: 'address', message: getErrorMessage('address') });
      setTimeout(() => refs.address.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return false;
    }
    for (let i = 0; i < content.partners.length; i++) {
      if (!content.partners[i]) {
        setError({ field: `partner-${i}`, message: language === 'es' ? 'Por favor llene todos los campos de los partners.' : 'Please fill in all fields for partners.' });
        setTimeout(() => refs.partners.current[i]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
        return false;
      }
    }
    for (let i = 0; i < content.schedule.length; i++) {
      const event = content.schedule[i];
      for (const field of ['date', 'name', 'location', 'description']) {
        if (!(event as any)[field]) {
          setError({ field: `schedule-${i}-${field}`, message: language === 'es' ? `Por favor llene el campo ${(t[language] as any)[field] || field} de la agenda ${i + 1}.` : `Please fill in the ${(t[language] as any)[field] || field} field for schedule ${i + 1}.` });
          setTimeout(() => (refs.schedule.current[i] as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
          return false;
        }
      }
    }
    for (let i = 0; i < content.speakers.length; i++) {
      const speaker = content.speakers[i];
      for (const field of ['name', 'category']) {
        if (!(speaker as any)[field]) {
          setError({ field: `speaker-${i}-${field}`, message: language === 'es' ? `Por favor llene el campo ${(t[language] as any)[field] || field} del ponente ${i + 1}.` : `Please fill in the ${(t[language] as any)[field] || field} field for speaker ${i + 1}.` });
          setTimeout(() => (refs.speakers.current[i] as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
          return false;
        }
      }
    }
    for (let i = 0; i < content.resources.length; i++) {
      const resource = content.resources[i];
      for (const field of ['link', 'title', 'description']) {
        if (!(resource as any)[field]) {
          setError({ field: `resource-${i}-${field}`, message: language === 'es' ? `Por favor llene el campo ${(t[language] as any)[field] || field} del recurso ${i + 1}.` : `Please fill in the ${(t[language] as any)[field] || field} field for resource ${i + 1}.` });
          setTimeout(() => (refs.resources.current[i] as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
          return false;
        }
      }
    }
    for (const field of ['tracks_text', 'speakers_text', 'join_custom_link', 'judging_guidelines', 'submission_deadline', 'registration_deadline']) {
      if (!(content as any)[field]) {
        setError({ field, message: getErrorMessage(field) });
        setTimeout(() => (refs as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const validateLastSection = () => {
    if (!formData.start_date || !formData.end_date || !formData.timezone || !formData.banner || !formData.participants) {
      setError({ field: 'start_date, end_date, timezone, banner, participants', message: language === 'es' ? 'Por favor llene todos los campos de inicio, fin, zona horaria, banner y participantes.' : 'Please fill in all fields for start_date, end_date, timezone, banner, and participants.' });
      return false;
    }
    setError(null);
    return true;
  };

  const validateForm = () => {
    return validateMainSection() && validateContentSection() && validateLastSection();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const valid = validateForm();
    if (!valid) {
      return;
    }
    const dataToSend = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      total_prizes: formData.total_prizes,
      tags: formData.tags,
      content: {
        tracks: formData.content.tracks,
        address: formData.content.address,
        partners: formData.content.partners,
        schedule: formData.content.schedule,
        speakers: formData.content.speakers,
        resources: formData.content.resources,
        tracks_text: formData.content.tracks_text,
        speakers_text: formData.content.speakers_text,
        join_custom_link: formData.content.join_custom_link,
        join_custom_text: null,
        judging_guidelines: formData.content.judging_guidelines,
        become_sponsor_link: "",
        submission_deadline: formData.content.submission_deadline,
        registration_deadline: formData.content.registration_deadline,
        submission_custom_link: null,
      },
      end_date: formData.end_date,
      start_date: formData.start_date,
      timezone: formData.timezone,
      banner: formData.banner,
      participants: formData.participants,
      top_most: true,
      organizers: null,
      custom_link: null,
      status: "UPCOMING"
    };
    console.log(dataToSend);
  };

  const handleDone = (section: 'main' | 'content' | 'last') => {
    setError(null);
    let valid = false;
    if (section === 'main') valid = validateMainSection();
    if (section === 'content') valid = validateContentSection();
    if (section === 'last') valid = validateLastSection();
    if (!valid) return;
    setCollapsed({ ...collapsed, [section]: true });
  };

  const validateSingleTrack = (track: any, trackIndex: number) => {
    for (const field of ['icon', 'logo', 'name', 'partner', 'description', 'short_description']) {
      if (!track[field]) {
        const label = trackFieldLabels[field] || field;
        setError({ field: `track-${trackIndex}-${field}`, message: language === 'es' ? `Por favor llene el campo "${label}" del track ${trackIndex + 1}.` : `Please fill in the "${label}" field for track ${trackIndex + 1}.` });
        setTimeout(() => (refs.tracks.current[trackIndex] as any)[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleTrackDone = (index: number) => {
    const valid = validateSingleTrack(formData.content.tracks[index], index);
    if (valid) {
      setCollapsedTracks((prev) => prev.map((v, i) => (i === index ? true : v)));
    }
  };

  const handleTrackExpand = (index: number) => {
    setCollapsedTracks((prev) => prev.map((v, i) => (i === index ? false : v)));
  };

  return (
    <div className="container mx-auto p-4">
      {/* Toast error message */}
      {showToast && error && (
        <div className="fixed top-6 right-6 z-50 bg-red-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 animate-fade-in-out">
          <span className="font-bold">⚠️</span>
          <span>{error.message}</span>
        </div>
      )}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="text-2xl focus:outline-none"
          title={language === 'en' ? t[language].switchToSpanish : t[language].switchToEnglish}
        >
          {language === 'en' ? '🇬🇧' : '🇪🇸'}
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-4">{t[language].editHackathons}</h1>
      <Button onClick={() => setShowForm(!showForm)} className="mb-4">
        {showForm ? t[language].cancel : t[language].addNewHackathon}
      </Button>
      {showForm && (
        <>
          {error && (
            <div className="text-red-500 font-medium mb-4">
              {error.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-6 my-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{t[language].mainTopics}</h2>
                {collapsed.main && (
                  <button onClick={() => setCollapsed({ ...collapsed, main: false })} className="flex items-center gap-1 text-zinc-400 hover:text-red-500 cursor-pointer">
                    <ChevronRight className="w-5 h-5" /> {t[language].expand}
                  </button>
                )}
              </div>
              {!collapsed.main && (
                <>
                  <div className="mb-2 text-zinc-400 text-sm">{t[language].mainName}</div>
                  <Input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full mb-4"
                    required
                    ref={refs.title}
                  />
                  <div className="mb-2 text-zinc-400 text-sm">{t[language].description}</div>
                  <Input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full mb-4"
                    required
                    ref={refs.description}
                  />
                  <div className="mb-2 text-zinc-400 text-sm">{t[language].city}</div>
                  <Input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full mb-4"
                    required
                    ref={refs.location}
                  />
                  <div className="mb-2 text-zinc-400 text-sm">{t[language].totalPrizes}</div>
                  <Input
                    type="number"
                    name="total_prizes"
                    placeholder="Total Prizes"
                    value={formData.total_prizes}
                    onChange={handleInputChange}
                    className="w-full mb-4"
                    required
                    ref={refs.total_prizes}
                  />
                  <div className="flex flex-col space-y-2 bg-zinc-900/60 border border-zinc-700 rounded-lg p-4 my-4">
                    <label className="font-medium">Tags:</label>
                    <div className="mb-2 text-zinc-400 text-sm">{t[language].tagsHelp}</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {formData.tags.map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Input
                            type="text"
                            value={tag}
                            onChange={e => handleTagChange(idx, e.target.value)}
                            className="w-32 px-2 py-1 text-sm"
                            placeholder={`Tag ${idx + 1}`}
                            required
                            ref={refs.tags}
                          />
                          {formData.tags.length > 1 && (
                            <button type="button" onClick={() => removeTag(idx)} className="text-red-500 hover:text-red-700 px-1">×</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addTag} className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white ml-2">
                        <span className="text-lg font-bold">+</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button 
                      type="button"
                      onClick={() => handleDone('main')} 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      {t[language].done} <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
              {collapsed.main && (
                <div className="text-zinc-400 italic">{t[language].mainTopicsCompleted}</div>
              )}
            </div>
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-6 my-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{t[language].content}</h2>
                {collapsed.content && (
                  <button onClick={() => setCollapsed({ ...collapsed, content: false })} className="flex items-center gap-1 text-zinc-400 hover:text-red-500 cursor-pointer">
                    <ChevronRight className="w-5 h-5" /> {t[language].expand}
                  </button>
                )}
              </div>
              {!collapsed.content && (
                <>
                  <div className="space-y-4">
                    <label className="font-medium text-xl">{t[language].tracks}:</label>
                    {formData.content.tracks.map((track, index) => (
                      <div
                        key={index}
                        className={`border border-zinc-700 rounded-lg p-4 mb-6 bg-zinc-900/40 relative transition-all duration-300 ease-in-out ${removing[`track-${index}`] ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}
                      >
                        {formData.content.tracks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => animateRemove('track', index, removeTrack)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg p-2 transition-transform duration-200 hover:scale-110 flex items-center justify-center cursor-pointer"
                            title={t[language].removeTrack}
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        )}
                        <h3 className="text-lg font-semibold mb-2">Track {index + 1}</h3>
                        {collapsedTracks[index] ? (
                          <div className="flex justify-end">
                            <button type="button" onClick={() => handleTrackExpand(index)} className="flex items-center gap-1 text-zinc-400 hover:text-red-500 cursor-pointer">
                              <ChevronRight className="w-5 h-5" /> {t[language].expand}
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].selectIcon}</div>
                            <Select
                              value={track.icon}
                              onValueChange={(value) => handleTrackChange(index, 'icon', value)}
                            >
                              <SelectTrigger className="mb-3">
                                <SelectValue placeholder="Select Icon" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="server">Server</SelectItem>
                                <SelectItem value="link">Link</SelectItem>
                                <SelectItem value="brain-circuit">Brain Circuit</SelectItem>
                                <SelectItem value="wrench">Wrench</SelectItem>
                                <SelectItem value="cpu">CPU</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].selectLogo}</div>
                            <Select
                              value={track.logo}
                              onValueChange={(value) => handleTrackChange(index, 'logo', value)}
                            >
                              <SelectTrigger className="mb-3">
                                <SelectValue placeholder="Select Logo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="server">Server</SelectItem>
                                <SelectItem value="link">Link</SelectItem>
                                <SelectItem value="brain-circuit">Brain Circuit</SelectItem>
                                <SelectItem value="wrench">Wrench</SelectItem>
                                <SelectItem value="cpu">CPU</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].trackName}</div>
                            <Input
                              type="text"
                              placeholder="Name"
                              value={track.name}
                              onChange={(e) => handleTrackChange(index, 'name', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.tracks.current[index].name}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].trackPartner}</div>
                            <Input
                              type="text"
                              placeholder="Partner"
                              value={track.partner}
                              onChange={(e) => handleTrackChange(index, 'partner', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.tracks.current[index].partner}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].trackDescription}</div>
                            <Input
                              type="text"
                              placeholder="Description"
                              value={track.description}
                              onChange={(e) => handleTrackChange(index, 'description', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.tracks.current[index].description}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].shortDescription}</div>
                            <Input
                              type="text"
                              placeholder="Short Description"
                              value={track.short_description}
                              onChange={(e) => handleTrackChange(index, 'short_description', e.target.value)}
                              className="w-full mb-1"
                              required
                              ref={refs.tracks.current[index].short_description}
                            />
                            <div className="flex justify-end mt-2">
                              <button type="button" onClick={() => handleTrackDone(index)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1 cursor-pointer">
                                {t[language].done} <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button type="button" onClick={addTrack} className="mt-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t[language].addTrack}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="font-medium text-xl mb-2 block">{t[language].address}:</label>
                    <div className="mb-2 text-zinc-400 text-sm">{t[language].addressHelp}</div>
                    <Input
                      type="text"
                      placeholder="Address"
                      value={formData.content.address}
                      onChange={(e) => setFormData({ ...formData, content: { ...formData.content, address: e.target.value } })}
                      className="w-full mb-4"
                      required
                      ref={refs.address}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="font-medium text-xl mb-2 block">{t[language].partners}:</label>
                    <div className="mb-2 text-zinc-400 text-sm">{t[language].partnersHelp}</div>
                    <div className="flex flex-wrap gap-2 items-center mb-4">
                      {formData.content.partners.map((partner, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Input
                            type="text"
                            value={partner}
                            onChange={e => handlePartnerInputChange(idx, e.target.value)}
                            className="w-40 px-2 py-1 text-sm"
                            placeholder={`Partner ${idx + 1}`}
                            required
                            ref={refs.partners.current[idx]}
                          />
                          {formData.content.partners.length > 1 && (
                            <button type="button" onClick={() => removePartner(idx)} className="text-red-500 hover:text-red-700 px-1">×</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addPartner} className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white ml-2">
                        <span className="text-lg font-bold">+</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="font-medium text-xl mb-2 block">{t[language].schedule}:</label>
                    <div className="mb-2 text-zinc-400 text-sm">{t[language].scheduleHelp}</div>
                    {formData.content.schedule.map((event, index) => (
                      <div
                        key={index}
                        className={`border border-zinc-700 rounded-lg p-4 mb-6 bg-zinc-900/40 relative transition-all duration-300 ease-in-out ${removing[`schedule-${index}`] ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}
                      >
                        {formData.content.schedule.length > 1 && (
                          <button
                            type="button"
                            onClick={() => animateRemove('schedule', index, removeSchedule)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg p-2 transition-transform duration-200 hover:scale-110 flex items-center justify-center cursor-pointer"
                            title={t[language].removeSchedule}
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        )}
                        <h3 className="text-lg font-semibold mb-2">Schedule {index + 1}</h3>
                        {collapsedSchedules[index] ? (
                          <div className="flex justify-end">
                            <button type="button" onClick={() => handleScheduleExpand(index)} className="flex items-center gap-1 text-zinc-400 hover:text-red-500 cursor-pointer">
                              <ChevronRight className="w-5 h-5" /> {t[language].expand}
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].scheduleDate}</div>
                            <Input
                              type="datetime-local"
                              placeholder="Date"
                              value={event.date}
                              onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.schedule.current[index].date}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].scheduleName}</div>
                            <Input
                              type="text"
                              placeholder="Name"
                              value={event.name}
                              onChange={(e) => handleScheduleChange(index, 'name', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.schedule.current[index].name}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].scheduleCategory}</div>
                            <Select
                              value={event.category}
                              onValueChange={(value) => handleScheduleChange(index, 'category', value)}
                            >
                              <SelectTrigger className="mb-3">
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Registration">Registration</SelectItem>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Info session">Info session</SelectItem>
                                <SelectItem value="Networking">Networking</SelectItem>
                                <SelectItem value="Workshop">Workshop</SelectItem>
                                <SelectItem value="Hacking">Hacking</SelectItem>
                                <SelectItem value="Wellness">Wellness</SelectItem>
                                <SelectItem value="Deadline">Deadline</SelectItem>
                                <SelectItem value="Judging">Judging</SelectItem>
                                <SelectItem value="Ceremony">Ceremony</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].scheduleLocation}</div>
                            <Input
                              type="text"
                              placeholder="Location"
                              value={event.location}
                              onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.schedule.current[index].location}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].scheduleDescription}</div>
                            <Input
                              type="text"
                              placeholder="Description"
                              value={event.description}
                              onChange={(e) => handleScheduleChange(index, 'description', e.target.value)}
                              className="w-full mb-1"
                              required
                              ref={refs.schedule.current[index].description}
                            />
                            <div className="flex justify-end mt-2">
                              <button type="button" onClick={() => handleScheduleDone(index)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1 cursor-pointer">
                                {t[language].done} <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button type="button" onClick={addSchedule} className="mt-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t[language].addSchedule}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="font-medium text-xl mb-2 block">{t[language].speakers}:</label>
                    {formData.content.speakers.map((speaker, index) => (
                      <div
                        key={index}
                        className={`border border-zinc-700 rounded-lg p-4 mb-6 bg-zinc-900/40 relative transition-all duration-300 ease-in-out ${removing[`speaker-${index}`] ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}
                      >
                        {formData.content.speakers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => animateRemove('speaker', index, removeSpeaker)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg p-2 transition-transform duration-200 hover:scale-110 flex items-center justify-center cursor-pointer"
                            title={t[language].removeSpeaker}
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        )}
                        <h3 className="text-lg font-semibold mb-2">Speaker {index + 1}</h3>
                        {collapsedSpeakers[index] ? (
                          <div className="flex justify-end">
                            <button type="button" onClick={() => handleSpeakerExpand(index)} className="flex items-center gap-1 text-zinc-400 hover:text-red-500 cursor-pointer">
                              <ChevronRight className="w-5 h-5" /> {t[language].expand}
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].speakerIcon}</div>
                            <Select
                              value={speaker.icon}
                              onValueChange={(value) => handleSpeakerChange(index, 'icon', value)}
                            >
                              <SelectTrigger className="mb-3">
                                <SelectValue placeholder="Select Icon" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="code">Code</SelectItem>
                                <SelectItem value="megaphone">Megaphone</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].speakerName}</div>
                            <Input
                              type="text"
                              placeholder="Name"
                              value={speaker.name}
                              onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.speakers.current[index].name}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].speakerCompany}</div>
                            <Input
                              type="text"
                              placeholder="Category"
                              value={speaker.category}
                              onChange={(e) => handleSpeakerChange(index, 'category', e.target.value)}
                              className="w-full mb-1"
                              required
                              ref={refs.speakers.current[index].category}
                            />
                            <div className="flex justify-end mt-2">
                              <button type="button" onClick={() => handleSpeakerDone(index)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1 cursor-pointer">
                                {t[language].done} <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button type="button" onClick={addSpeaker} className="mt-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t[language].addSpeaker}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="font-medium text-xl mb-2 block">{t[language].resources}:</label>
                    {formData.content.resources.map((resource, index) => (
                      <div
                        key={index}
                        className={`border border-zinc-700 rounded-lg p-4 mb-6 bg-zinc-900/40 relative transition-all duration-300 ease-in-out ${removing[`resource-${index}`] ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}
                      >
                        {formData.content.resources.length > 1 && (
                          <button
                            type="button"
                            onClick={() => animateRemove('resource', index, removeResource)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg p-2 transition-transform duration-200 hover:scale-110 flex items-center justify-center cursor-pointer"
                            title={t[language].removeResource}
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        )}
                        <h3 className="text-lg font-semibold mb-2">Resource {index + 1}</h3>
                        {collapsedResources[index] ? (
                          <div className="flex justify-end">
                            <button type="button" onClick={() => handleResourceExpand(index)} className="flex items-center gap-1 text-zinc-400 hover:text-red-500 cursor-pointer">
                              <ChevronRight className="w-5 h-5" /> {t[language].expand}
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].resourceIcon}</div>
                            <Select
                              value={resource.icon}
                              onValueChange={(value) => handleResourceChange(index, 'icon', value)}
                            >
                              <SelectTrigger className="mb-3">
                                <SelectValue placeholder="Select Icon" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="app-window">App Window</SelectItem>
                                <SelectItem value="pickaxe">Pickaxe</SelectItem>
                                <SelectItem value="package">Package</SelectItem>
                                <SelectItem value="layout-grid">Layout Grid</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].resourceLink}</div>
                            <Input
                              type="text"
                              placeholder="Link"
                              value={resource.link}
                              onChange={(e) => handleResourceChange(index, 'link', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.resources.current[index].link}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].resourceTitle}</div>
                            <Input
                              type="text"
                              placeholder="Title"
                              value={resource.title}
                              onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                              className="w-full mb-3"
                              required
                              ref={refs.resources.current[index].title}
                            />
                            <div className="mb-2 text-zinc-400 text-sm">{t[language].resourceDescription}</div>
                            <Input
                              type="text"
                              placeholder="Description"
                              value={resource.description}
                              onChange={(e) => handleResourceChange(index, 'description', e.target.value)}
                              className="w-full mb-1"
                              required
                              ref={refs.resources.current[index].description}
                            />
                            <div className="flex justify-end mt-2">
                              <button type="button" onClick={() => handleResourceDone(index)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1 cursor-pointer">
                                {t[language].done} <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button type="button" onClick={addResource} className="mt-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t[language].addResource}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].trackText}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].trackTextHelp}</div>
                      <Input
                        type="text"
                        placeholder="Tracks Text"
                        value={formData.content.tracks_text}
                        onChange={e => setFormData({ ...formData, content: { ...formData.content, tracks_text: e.target.value } })}
                        className="w-full mb-4"
                        required
                        ref={refs.tracks_text}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].speakerText}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].speakerTextHelp}</div>
                      <Input
                        type="text"
                        placeholder="Speakers Text"
                        value={formData.content.speakers_text}
                        onChange={e => setFormData({ ...formData, content: { ...formData.content, speakers_text: e.target.value } })}
                        className="w-full mb-4"
                        required
                        ref={refs.speakers_text}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].joinCustomLink}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].joinCustomLinkHelp}</div>
                      <Input
                        type="text"
                        placeholder="Join Custom Link"
                        value={formData.content.join_custom_link}
                        onChange={e => setFormData({ ...formData, content: { ...formData.content, join_custom_link: e.target.value } })}
                        className="w-full mb-4"
                        required
                        ref={refs.join_custom_link}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].judgingGuidelines}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].judgingGuidelinesHelp}</div>
                      <Input
                        type="text"
                        placeholder="Judging Guidelines"
                        value={formData.content.judging_guidelines}
                        onChange={e => setFormData({ ...formData, content: { ...formData.content, judging_guidelines: e.target.value } })}
                        className="w-full mb-4"
                        required
                        ref={refs.judging_guidelines}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].submissionDeadline}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].submissionDeadlineHelp}</div>
                      <Input
                        type="datetime-local"
                        placeholder="Submission Deadline"
                        value={formData.content.submission_deadline}
                        onChange={e => setFormData({ ...formData, content: { ...formData.content, submission_deadline: e.target.value } })}
                        className="w-full mb-4"
                        required
                        ref={refs.submission_deadline}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].registrationDeadline}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].registrationDeadlineHelp}</div>
                      <Input
                        type="datetime-local"
                        placeholder="Registration Deadline"
                        value={formData.content.registration_deadline}
                        onChange={e => setFormData({ ...formData, content: { ...formData.content, registration_deadline: e.target.value } })}
                        className="w-full mb-4"
                        required
                        ref={refs.registration_deadline}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button 
                      type="button"
                      onClick={() => handleDone('content')} 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      {t[language].done} <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
              {collapsed.content && (
                <div className="text-zinc-400 italic">{t[language].contentCompleted}</div>
              )}
            </div>
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-6 my-6 mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{t[language].lastDetails}</h2>
                {collapsed.last && (
                  <button onClick={() => setCollapsed({ ...collapsed, last: false })} className="flex items-center gap-1 text-zinc-400 hover:text-red-500 cursor-pointer">
                    <ChevronRight className="w-5 h-5" /> {t[language].expand}
                  </button>
                )}
              </div>
              {!collapsed.last && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].startDate}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].startDateHelp}</div>
                      <Input
                        type="datetime-local"
                        placeholder="Start Date"
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full mb-4"
                        required
                        ref={refs.start_date}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].endDate}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].endDateHelp}</div>
                      <Input
                        type="datetime-local"
                        placeholder="End Date"
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full mb-4"
                        required
                        ref={refs.end_date}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].timezone}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].timezoneHelp}</div>
                      <Input
                        type="text"
                        placeholder="Timezone"
                        value={formData.timezone}
                        onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full mb-4"
                        required
                        ref={refs.timezone}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].banner}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].bannerHelp}</div>
                      <Input
                        type="text"
                        placeholder="Banner URL"
                        value={formData.banner}
                        onChange={e => setFormData({ ...formData, banner: e.target.value })}
                        className="w-full mb-4"
                        required
                        ref={refs.banner}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xl mb-2 block">{t[language].participants}:</label>
                      <div className="mb-2 text-zinc-400 text-sm">{t[language].participantsHelp}</div>
                      <Input
                        type="number"
                        placeholder="Participants"
                        value={formData.participants}
                        onChange={e => setFormData({ ...formData, participants: e.target.value })}
                        className="w-full mb-4"
                        required
                        ref={refs.participants}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button 
                      type="button"
                      onClick={() => handleDone('last')} 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      {t[language].done} <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
              {collapsed.last && (
                <div className="text-zinc-400 italic">{t[language].lastDetailsCompleted}</div>
              )}
            </div>
            <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white">
              {t[language].submit}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default HackathonsEdit; 