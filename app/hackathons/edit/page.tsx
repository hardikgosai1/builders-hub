'use client';

import React, { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // Aquí puedes manejar el envío del formulario
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Hackathons</h1>
      <Button onClick={() => setShowForm(!showForm)} className="mb-4">
        {showForm ? 'Cancel' : 'Add new hackathon'}
      </Button>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-6 my-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Main topics</h2>
              {collapsed.main && (
                <button onClick={() => setCollapsed({ ...collapsed, main: false })} className="flex items-center gap-1 text-zinc-400 hover:text-red-500">
                  <ChevronRight className="w-5 h-5" /> Expand
                </button>
              )}
            </div>
            {!collapsed.main && (
              <>
                <div className="mb-2 text-zinc-400 text-sm">Main name of the hackathon</div>
                <Input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full mb-4"
                />
                <div className="mb-2 text-zinc-400 text-sm">Description of the hackathon</div>
                <Input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full mb-4"
                />
                <div className="mb-2 text-zinc-400 text-sm">City of the hackathon</div>
                <Input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full mb-4"
                />
                <div className="mb-2 text-zinc-400 text-sm">Total prizes</div>
                <Input
                  type="number"
                  name="total_prizes"
                  placeholder="Total Prizes"
                  value={formData.total_prizes}
                  onChange={handleInputChange}
                  className="w-full mb-4"
                />
                <div className="flex flex-col space-y-2 bg-zinc-900/60 border border-zinc-700 rounded-lg p-4 my-4">
                  <label className="font-medium">Tags:</label>
                  <div className="mb-2 text-zinc-400 text-sm">Categories to be evaluated in the hackathon</div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {formData.tags.map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <Input
                          type="text"
                          value={tag}
                          onChange={e => handleTagChange(idx, e.target.value)}
                          className="w-32 px-2 py-1 text-sm"
                          placeholder={`Tag ${idx + 1}`}
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
                <button onClick={() => setCollapsed({ ...collapsed, main: true })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1">
                    Done <ChevronDown className="w-4 h-4" />
                </button>
                </div>
              </>
            )}
            {collapsed.main && (
              <div className="text-zinc-400 italic">Main topics completed</div>
            )}
          </div>
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-6 my-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Content</h2>
              {collapsed.content && (
                <button onClick={() => setCollapsed({ ...collapsed, content: false })} className="flex items-center gap-1 text-zinc-400 hover:text-red-500">
                  <ChevronRight className="w-5 h-5" /> Expand
                </button>
              )}
            </div>
            {!collapsed.content && (
              <>
                <div className="space-y-4">
                  <label className="font-medium text-xl">Tracks:</label>
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
                          title="Remove track"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                      <h3 className="text-lg font-semibold mb-2">Track {index + 1}</h3>
                      <div className="mb-2 text-zinc-400 text-sm">Select an icon for the track</div>
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
                      <div className="mb-2 text-zinc-400 text-sm">Select a logo for the track</div>
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
                      <div className="mb-2 text-zinc-400 text-sm">Type the name of the track</div>
                      <Input
                        type="text"
                        placeholder="Name"
                        value={track.name}
                        onChange={(e) => handleTrackChange(index, 'name', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Type the name of the partner sponsoring this track</div>
                      <Input
                        type="text"
                        placeholder="Partner"
                        value={track.partner}
                        onChange={(e) => handleTrackChange(index, 'partner', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Type a detailed description of the track. You can use HTML tags like &lt;b&gt;&lt;/b&gt;, &lt;a href=""&gt;&lt;/a&gt;, etc.</div>
                      <Input
                        type="text"
                        placeholder="Description"
                        value={track.description}
                        onChange={(e) => handleTrackChange(index, 'description', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Short description of the track</div>
                      <Input
                        type="text"
                        placeholder="Short Description"
                        value={track.short_description}
                        onChange={(e) => handleTrackChange(index, 'short_description', e.target.value)}
                        className="w-full mb-1"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button type="button" onClick={addTrack} className="mt-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Track
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="font-medium text-xl mb-2 block">Address:</label>
                  <div className="mb-2 text-zinc-400 text-sm">Detailed address of the hackathon within the city</div>
                  <Input
                    type="text"
                    placeholder="Address"
                    value={formData.content.address}
                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, address: e.target.value } })}
                    className="w-full mb-4"
                  />
                </div>
                <div className="space-y-4">
                  <label className="font-medium text-xl mb-2 block">Partners:</label>
                  <div className="mb-2 text-zinc-400 text-sm">Type the partners of the hackathon</div>
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    {formData.content.partners.map((partner, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <Input
                          type="text"
                          value={partner}
                          onChange={e => handlePartnerInputChange(idx, e.target.value)}
                          className="w-40 px-2 py-1 text-sm"
                          placeholder={`Partner ${idx + 1}`}
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
                  <label className="font-medium text-xl mb-2 block">Schedule:</label>
                  <div className="mb-2 text-zinc-400 text-sm">Hackathon agendas like Team Formation, Workshop: Mastering Avalanche, etc.</div>
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
                          title="Remove schedule"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                      <h3 className="text-lg font-semibold mb-2">Schedule {index + 1}</h3>
                      <div className="mb-2 text-zinc-400 text-sm">Date of the scheduled activity</div>
                      <Input
                        type="datetime-local"
                        placeholder="Date"
                        value={event.date}
                        onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Name of the scheduled activity</div>
                      <Input
                        type="text"
                        placeholder="Name"
                        value={event.name}
                        onChange={(e) => handleScheduleChange(index, 'name', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Category of the scheduled activity</div>
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
                      <div className="mb-2 text-zinc-400 text-sm">Location of the activity, e.g. Auditorium, Study Room, etc.</div>
                      <Input
                        type="text"
                        placeholder="Location"
                        value={event.location}
                        onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Description of the scheduled activity</div>
                      <Input
                        type="text"
                        placeholder="Description"
                        value={event.description}
                        onChange={(e) => handleScheduleChange(index, 'description', e.target.value)}
                        className="w-full mb-1"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button type="button" onClick={addSchedule} className="mt-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Schedule
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="font-medium text-xl mb-2 block">Speakers:</label>
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
                          title="Remove speaker"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                      <h3 className="text-lg font-semibold mb-2">Speaker {index + 1}</h3>
                      <div className="mb-2 text-zinc-400 text-sm">Select an icon for the speaker</div>
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
                      <div className="mb-2 text-zinc-400 text-sm">Type the name of the speaker</div>
                      <Input
                        type="text"
                        placeholder="Name"
                        value={speaker.name}
                        onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Type the company the speaker represents</div>
                      <Input
                        type="text"
                        placeholder="Category"
                        value={speaker.category}
                        onChange={(e) => handleSpeakerChange(index, 'category', e.target.value)}
                        className="w-full mb-1"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button type="button" onClick={addSpeaker} className="mt-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Speaker
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="font-medium text-xl mb-2 block">Resources:</label>
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
                          title="Remove resource"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                      <h3 className="text-lg font-semibold mb-2">Resource {index + 1}</h3>
                      <div className="mb-2 text-zinc-400 text-sm">Select an icon for the resource</div>
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
                      <div className="mb-2 text-zinc-400 text-sm">Type the link of the resource</div>
                      <Input
                        type="text"
                        placeholder="Link"
                        value={resource.link}
                        onChange={(e) => handleResourceChange(index, 'link', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Type the title of the resource</div>
                      <Input
                        type="text"
                        placeholder="Title"
                        value={resource.title}
                        onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                        className="w-full mb-3"
                      />
                      <div className="mb-2 text-zinc-400 text-sm">Type the description of the resource</div>
                      <Input
                        type="text"
                        placeholder="Description"
                        value={resource.description}
                        onChange={(e) => handleResourceChange(index, 'description', e.target.value)}
                        className="w-full mb-1"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button type="button" onClick={addResource} className="mt-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Resource
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-xl mb-2 block">Track Text</label>
                    <div className="mb-2 text-zinc-400 text-sm">Type the text field to be shown for tracks</div>
                    <Input
                      type="text"
                      placeholder="Tracks Text"
                      value={formData.content.tracks_text}
                      onChange={e => setFormData({ ...formData, content: { ...formData.content, tracks_text: e.target.value } })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">Speaker Text</label>
                    <div className="mb-2 text-zinc-400 text-sm">Type the text field to be shown for speakers</div>
                    <Input
                      type="text"
                      placeholder="Speakers Text"
                      value={formData.content.speakers_text}
                      onChange={e => setFormData({ ...formData, content: { ...formData.content, speakers_text: e.target.value } })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">Join Custom Link</label>
                    <div className="mb-2 text-zinc-400 text-sm">Type the registration link for the hackathon</div>
                    <Input
                      type="text"
                      placeholder="Join Custom Link"
                      value={formData.content.join_custom_link}
                      onChange={e => setFormData({ ...formData, content: { ...formData.content, join_custom_link: e.target.value } })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">Judging Guidelines</label>
                    <div className="mb-2 text-zinc-400 text-sm">Type the judging guidelines. Note: You can use tags like &lt;h3&gt;&lt;/h3&gt;, /n, etc.</div>
                    <Input
                      type="text"
                      placeholder="Judging Guidelines"
                      value={formData.content.judging_guidelines}
                      onChange={e => setFormData({ ...formData, content: { ...formData.content, judging_guidelines: e.target.value } })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">Deadline project submission</label>
                    <div className="mb-2 text-zinc-400 text-sm">Select the deadline for project submission</div>
                    <Input
                      type="datetime-local"
                      placeholder="Submission Deadline"
                      value={formData.content.submission_deadline}
                      onChange={e => setFormData({ ...formData, content: { ...formData.content, submission_deadline: e.target.value } })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">Deadline hackathon registration</label>
                    <div className="mb-2 text-zinc-400 text-sm">Select the deadline for hackathon registration</div>
                    <Input
                      type="datetime-local"
                      placeholder="Registration Deadline"
                      value={formData.content.registration_deadline}
                      onChange={e => setFormData({ ...formData, content: { ...formData.content, registration_deadline: e.target.value } })}
                      className="w-full mb-4"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                <button onClick={() => setCollapsed({ ...collapsed, content: true })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1">
                    Done <ChevronDown className="w-4 h-4" />
                </button>
                </div>
              </>
            )}
            {collapsed.content && (
              <div className="text-zinc-400 italic">Content completed</div>
            )}
          </div>
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-6 my-6 mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Last details</h2>
              {collapsed.last && (
                <button onClick={() => setCollapsed({ ...collapsed, last: false })} className="flex items-center gap-1 text-zinc-400 hover:text-red-500">
                  <ChevronRight className="w-5 h-5" /> Expand
                </button>
              )}
            </div>
            {!collapsed.last && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-xl mb-2 block">Start Date</label>
                    <div className="mb-2 text-zinc-400 text-sm">Select the start date of the hackathon</div>
                    <Input
                      type="datetime-local"
                      placeholder="Start Date"
                      value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">End Date</label>
                    <div className="mb-2 text-zinc-400 text-sm">Select the end date of the hackathon</div>
                    <Input
                      type="datetime-local"
                      placeholder="End Date"
                      value={formData.end_date}
                      onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">Timezone</label>
                    <div className="mb-2 text-zinc-400 text-sm">Type the timezone where the hackathon will take place, e.g. Europe/London</div>
                    <Input
                      type="text"
                      placeholder="Timezone"
                      value={formData.timezone}
                      onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">Banner</label>
                    <div className="mb-2 text-zinc-400 text-sm">Type the URL of the image to be used as the banner</div>
                    <Input
                      type="text"
                      placeholder="Banner URL"
                      value={formData.banner}
                      onChange={e => setFormData({ ...formData, banner: e.target.value })}
                      className="w-full mb-4"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xl mb-2 block">Participants</label>
                    <div className="mb-2 text-zinc-400 text-sm">Type the maximum number of allowed participants</div>
                    <Input
                      type="number"
                      placeholder="Participants"
                      value={formData.participants}
                      onChange={e => setFormData({ ...formData, participants: e.target.value })}
                      className="w-full mb-4"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={() => setCollapsed({ ...collapsed, last: true })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center gap-1">
                    Done <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
            {collapsed.last && (
              <div className="text-zinc-400 italic">Last details completed</div>
            )}
          </div>
          <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white">
            Submit
          </Button>
        </form>
      )}
    </div>
  );
};

export default HackathonsEdit; 