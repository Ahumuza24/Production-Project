
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { workSessionId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Get work session details with related project and assembler info
  const { data: workSession } = await supabase
    .from('work_sessions')
    .select(`
      *,
      projects(name, created_by),
      components(name),
      processes(name),
      profiles!assembler_id(name, email)
    `)
    .eq('id', workSessionId)
    .single()
    
  // Get project lead email
  const { data: projectLead } = await supabase
    .from('profiles')
    .select('email, name')
    .eq('id', workSession.projects.created_by)
    .single()
    
  // Send email notification
  const emailData = {
    to: projectLead.email,
    subject: `Work Completed: ${workSession.projects.name}`,
    html: `
      <h2>Work Session Completed</h2>
      <p><strong>Project:</strong> ${workSession.projects.name}</p>
      <p><strong>Component:</strong> ${workSession.components.name}</p>
      <p><strong>Process:</strong> ${workSession.processes.name}</p>
      <p><strong>Assembler:</strong> ${workSession.profiles.name}</p>
      <p><strong>Parts Completed:</strong> ${workSession.parts_completed}</p>
      <p><strong>Duration:</strong> ${workSession.duration_minutes} minutes</p>
    `
  }
  
  // Send email using your preferred service (Resend, SendGrid, etc.)
  // For demonstration, we'll just log the email data.
  console.log('Sending email:', emailData);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
