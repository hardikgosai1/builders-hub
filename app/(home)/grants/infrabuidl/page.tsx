"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Page() {
  const [formData, setFormData] = useState({
    // Personal/Team Information
    projectName: "",
    teamName: "",
    contactName: "",
    contactEmail: "",
    contactTelegram: "",
    contactDiscord: "",
    
    // Project Details
    projectWebsite: "",
    githubRepo: "",
    projectCategory: "",
    projectDescription: "",
    
    // Technical Details
    technicalArchitecture: "",
    avaxIntegration: "",
    
    // Business & Impact
    problemStatement: "",
    targetAudience: "",
    impactOnEcosystem: "",
    
    // Funding & Timeline
    fundingAmount: "",
    timelineEstimate: "",
    milestones: "",
    teamExperience: "",
    previousProjects: "",
    
    // Agreements
    privacyPolicy: false,
    marketingEmails: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="w-full relative mb-8">
          <Image
            src="/infrabuidl.png"
            alt="Avalanche infraBUILD() Program"
            width={800}
            height={200}
            className="w-full h-auto rounded-lg"
            priority
          />
        </div>
        <h1 className="text-5xl font-semibold mb-4">Avalanche<br/>infraBUIDL()<br/>Program</h1>
        <h2 className="text-2xl mb-6 text-red-500">Application Form</h2>
        
        <div className="mb-12 space-y-4">
          <p>
            The Avalanche infraBUILD() Program is designed to fortify the Avalanche ecosystem by supporting
            infrastructure projects that enhance user and developer experience.
          </p>
          
          <p className="text-gray-400">
            infraBUILD() will fund projects demonstrating innovation or strategic importance
            to the broader Avalanche ecosystem. The program will support onramps,
            validator marketplaces, VMs, wallets, oracles, interoperability tools,
            cryptography, bridges, explorers, RPCs, data storage, indexers, token
            engineering, and more!
          </p>
          
          <p className="text-gray-400">
            To be considered for support from the program, please fill out the form with all
            relevant details, and the Avalanche Foundation will reach out to discuss your
            project.
          </p>
          
          <p className="text-gray-400">
            For further information on the infraBUILD() Program, including eligibility criteria
            and application requirements, visit the <a href="#" className="text-red-500 underline">Forum</a>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project & Team Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Project & Team Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                name="projectName"
                placeholder="Your project name"
                value={formData.projectName}
                onChange={handleChange}
                className="h-14 bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teamName">Team/Organization Name</Label>
              <Input
                id="teamName"
                name="teamName"
                placeholder="Your team or organization name"
                value={formData.teamName}
                onChange={handleChange}
                className="h-14 bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  placeholder="Full name"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="h-14 bg-gray-900 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="Email address"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="h-14 bg-gray-900 border-gray-700"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactTelegram">Telegram Handle (optional)</Label>
                <Input
                  id="contactTelegram"
                  name="contactTelegram"
                  placeholder="@username"
                  value={formData.contactTelegram}
                  onChange={handleChange}
                  className="h-14 bg-gray-900 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDiscord">Discord Handle (optional)</Label>
                <Input
                  id="contactDiscord"
                  name="contactDiscord"
                  placeholder="username#0000"
                  value={formData.contactDiscord}
                  onChange={handleChange}
                  className="h-14 bg-gray-900 border-gray-700"
                />
              </div>
            </div>
          </div>
          
          {/* Project Details Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Project Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="projectWebsite">Project Website (if available)</Label>
              <Input
                id="projectWebsite"
                name="projectWebsite"
                placeholder="https://"
                value={formData.projectWebsite}
                onChange={handleChange}
                className="h-14 bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="githubRepo">GitHub Repository (if available)</Label>
              <Input
                id="githubRepo"
                name="githubRepo"
                placeholder="https://github.com/..."
                value={formData.githubRepo}
                onChange={handleChange}
                className="h-14 bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectCategory">Project Category</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("projectCategory", value)}
                value={formData.projectCategory}
              >
                <SelectTrigger className="h-14 bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="onramp">Onramp</SelectItem>
                  <SelectItem value="validator">Validator Marketplace</SelectItem>
                  <SelectItem value="vm">Virtual Machine (VM)</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="oracle">Oracle</SelectItem>
                  <SelectItem value="interop">Interoperability Tool</SelectItem>
                  <SelectItem value="bridge">Bridge</SelectItem>
                  <SelectItem value="explorer">Explorer</SelectItem>
                  <SelectItem value="rpc">RPC Service</SelectItem>
                  <SelectItem value="storage">Data Storage</SelectItem>
                  <SelectItem value="indexer">Indexer</SelectItem>
                  <SelectItem value="token">Token Engineering</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description</Label>
              <Textarea
                id="projectDescription"
                name="projectDescription"
                placeholder="Provide a comprehensive description of your project"
                value={formData.projectDescription}
                onChange={handleChange}
                className="min-h-[150px] bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          
          {/* Technical Details Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Technical Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="technicalArchitecture">Technical Architecture</Label>
              <Textarea
                id="technicalArchitecture"
                name="technicalArchitecture"
                placeholder="Describe the technical architecture of your project"
                value={formData.technicalArchitecture}
                onChange={handleChange}
                className="min-h-[150px] bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avaxIntegration">Avalanche Integration</Label>
              <Textarea
                id="avaxIntegration"
                name="avaxIntegration"
                placeholder="Explain how your project integrates with the Avalanche ecosystem"
                value={formData.avaxIntegration}
                onChange={handleChange}
                className="min-h-[150px] bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          
          {/* Business & Impact Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Business & Ecosystem Impact</h3>
            
            <div className="space-y-2">
              <Label htmlFor="problemStatement">Problem Statement</Label>
              <Textarea
                id="problemStatement"
                name="problemStatement"
                placeholder="What problem does your project solve?"
                value={formData.problemStatement}
                onChange={handleChange}
                className="min-h-[100px] bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                name="targetAudience"
                placeholder="Who are the target users of your project?"
                value={formData.targetAudience}
                onChange={handleChange}
                className="min-h-[100px] bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="impactOnEcosystem">Impact on Avalanche Ecosystem</Label>
              <Textarea
                id="impactOnEcosystem"
                name="impactOnEcosystem"
                placeholder="How will your project benefit the Avalanche ecosystem?"
                value={formData.impactOnEcosystem}
                onChange={handleChange}
                className="min-h-[100px] bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          
          {/* Funding & Timeline Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Funding & Timeline</h3>
            
            <div className="space-y-2">
              <Label htmlFor="fundingAmount">Requested Funding Amount (in USD)</Label>
              <Input
                id="fundingAmount"
                name="fundingAmount"
                placeholder="$"
                value={formData.fundingAmount}
                onChange={handleChange}
                className="h-14 bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timelineEstimate">Estimated Timeline</Label>
              <Input
                id="timelineEstimate"
                name="timelineEstimate"
                placeholder="e.g., 3 months, 6 months"
                value={formData.timelineEstimate}
                onChange={handleChange}
                className="h-14 bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="milestones">Project Milestones</Label>
              <Textarea
                id="milestones"
                name="milestones"
                placeholder="List key milestones and deliverables with estimated completion dates"
                value={formData.milestones}
                onChange={handleChange}
                className="min-h-[150px] bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          
          {/* Team Experience Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Team Experience</h3>
            
            <div className="space-y-2">
              <Label htmlFor="teamExperience">Team Experience</Label>
              <Textarea
                id="teamExperience"
                name="teamExperience"
                placeholder="Describe your team's relevant experience and expertise"
                value={formData.teamExperience}
                onChange={handleChange}
                className="min-h-[150px] bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="previousProjects">Previous Projects</Label>
              <Textarea
                id="previousProjects"
                name="previousProjects"
                placeholder="List any previous projects or contributions to the blockchain space"
                value={formData.previousProjects}
                onChange={handleChange}
                className="min-h-[150px] bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          
          {/* Agreements Section */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="privacyPolicy" 
                checked={formData.privacyPolicy}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("privacyPolicy", checked as boolean)
                }
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="privacyPolicy" className="font-normal">
                  I have read the <a href="#" className="text-red-500 underline">privacy policy</a>.*
                </Label>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="marketingEmails" 
                checked={formData.marketingEmails}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("marketingEmails", checked as boolean)
                }
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="marketingEmails" className="font-normal">
                  I agree to receive marketing emails from the Avalanche Foundation.
                </Label>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mt-4">
              The Avalanche Foundation needs the contact information you provide to us to contact you about our products and services.
              You may unsubscribe from these communications at any time. For information on how to unsubscribe, as well as our privacy
              practices and commitment to protecting your privacy, please review our Privacy Policy.
            </p>
          </div>
          
          <Button type="submit" className="w-full h-14 mt-8 bg-red-500 hover:bg-red-600 text-white">
            Apply Now
          </Button>
        </form>
      </div>
    </div>
  )
}
