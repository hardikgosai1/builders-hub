'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const HackathonsEdit = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    total_prizes: '',
    tags: [''],
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
    },
  });

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
            <h2 className="text-2xl font-bold mb-4">Main topics</h2>
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
          </div>
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-6 my-6">
            <h2 className="text-2xl font-bold mb-4">Content</h2>
            <div className="space-y-4">
              <label className="font-medium text-xl">Tracks:</label>
              {formData.content.tracks.map((track, index) => (
                <div key={index} className="border border-zinc-700 rounded-lg p-4 mb-6 bg-zinc-900/40">
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
                <div key={index} className="border border-zinc-700 rounded-lg p-4 mb-6 bg-zinc-900/40">
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
                <div key={index} className="border border-zinc-700 rounded-lg p-4 mb-6 bg-zinc-900/40">
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