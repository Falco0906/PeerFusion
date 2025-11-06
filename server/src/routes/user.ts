import { Router } from 'express';
import { supabase } from '../supabase';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get user by ID or 'me'
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const paramId = req.params.id;
    const authenticatedUserId = (req as any).user.id;
    
    console.log('👤 Fetching user profile for param:', paramId, 'authenticated user:', authenticatedUserId);
    
    // If the ID is 'me', use the authenticated user's ID
    const userId = paramId === 'me' ? authenticatedUserId : parseInt(paramId);
    
    if (paramId !== 'me' && isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, bio, institution, field_of_study, avatar, created_at')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      console.log('❌ User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User profile fetched successfully');
    res.json(user);
  } catch (err) {
    console.error('❌ Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { first_name, last_name, bio, institution, field_of_study } = req.body;
    
    console.log('📝 Updating profile for user ID:', userId);
    
    // Validate input
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ first_name, last_name, bio, institution, field_of_study })
      .eq('id', userId)
      .select('id, email, first_name, last_name, bio, institution, field_of_study, created_at')
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Profile updated successfully');
    res.json(user);
  } catch (err) {
    console.error('❌ Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add a skill for the authenticated user
router.post('/skills', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const {
      skill_name,
      category,
      proficiency_level,
      description,
      years_of_experience,
      willing_to_mentor,
      willing_to_collaborate
    } = req.body;

    console.log('🎯 Adding skill for user ID:', userId);

    // Validate required fields
    if (!skill_name || !category) {
      return res.status(400).json({ error: 'Skill name and category are required' });
    }

    const { data: skill, error } = await supabase
      .from('skills')
      .insert([{
        user_id: userId,
        skill_name,
        category,
        proficiency_level: proficiency_level || 'intermediate',
        description: description || null,
        years_of_experience: years_of_experience || null,
        willing_to_mentor: willing_to_mentor || false,
        willing_to_collaborate: willing_to_collaborate || false
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding skill:', error);
      return res.status(500).json({ error: 'Failed to add skill' });
    }

    console.log('✅ Skill added successfully');
    res.status(201).json(skill);
  } catch (err) {
    console.error('❌ Error adding skill:', err);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

// Get skills for a user
router.get('/:id/skills', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? (req as any).user.id : parseInt(req.params.id);

    console.log('🎯 Fetching skills for user ID:', userId);

    const { data: skills, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching skills:', error);
      return res.status(500).json({ error: 'Failed to fetch skills' });
    }

    console.log('✅ Skills fetched successfully');
    res.json(skills || []);
  } catch (err) {
    console.error('❌ Error fetching skills:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Update user settings/preferences
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { 
      email_notifications, 
      project_updates, 
      message_notifications,
      location,
      linkedin_url,
      github_url,
      scholar_url,
      orcid,
      website_url,
      phone,
      is_profile_public
    } = req.body;

    console.log('⚙️  Updating settings for user ID:', userId);

    // Build update object with only provided fields
    const updateData: any = {};
    if (location !== undefined) updateData.location = location;
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url;
    if (github_url !== undefined) updateData.github_url = github_url;
    if (scholar_url !== undefined) updateData.scholar_url = scholar_url;
    if (orcid !== undefined) updateData.orcid = orcid;
    if (website_url !== undefined) updateData.website_url = website_url;
    if (phone !== undefined) updateData.phone = phone;
    if (is_profile_public !== undefined) updateData.is_profile_public = is_profile_public;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('❌ Error updating settings:', error);
        return res.status(500).json({ error: 'Failed to update settings' });
      }
    }

    res.json({ 
      message: 'Settings updated successfully',
      settings: {
        email_notifications,
        project_updates,
        message_notifications
      }
    });
  } catch (err) {
    console.error('❌ Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get user publications (Note: publications table needs to be added to schema)
router.get('/:id/publications', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? (req as any).user.id : parseInt(req.params.id);

    // Note: publications table is not in the current schema
    // This is a placeholder - you'll need to add the publications table
    res.json([]);
  } catch (err) {
    console.error('Error fetching publications:', err);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
});

// Add publication (Note: publications table needs to be added to schema)
router.post('/publications', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { title, authors, journal, year, doi, url, citation_count } = req.body;

    if (!title || !year) {
      return res.status(400).json({ error: 'Title and year are required' });
    }

    // Note: publications table is not in the current schema
    // This is a placeholder
    res.status(501).json({ error: 'Publications feature not yet implemented' });
  } catch (err) {
    console.error('Error adding publication:', err);
    res.status(500).json({ error: 'Failed to add publication' });
  }
});

// Endorse a skill
router.post('/skills/:skillId/endorse', authenticateToken, async (req, res) => {
  try {
    const endorserId = (req as any).user.id;
    const skillId = parseInt(req.params.skillId);

    // Check if skill exists and get the user_id
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('user_id')
      .eq('id', skillId)
      .single();
    
    if (skillError || !skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const skillOwnerId = skill.user_id;

    // Can't endorse your own skill
    if (skillOwnerId === endorserId) {
      return res.status(400).json({ error: 'Cannot endorse your own skill' });
    }

    // Check if already endorsed
    const { data: existingEndorsement } = await supabase
      .from('skill_endorsements')
      .select('*')
      .eq('skill_id', skillId)
      .eq('endorser_id', endorserId)
      .single();

    if (existingEndorsement) {
      return res.status(400).json({ error: 'Already endorsed this skill' });
    }

    // Create endorsement
    const { error: endorseError } = await supabase
      .from('skill_endorsements')
      .insert([{ skill_id: skillId, endorser_id: endorserId }]);

    if (endorseError) {
      console.error('❌ Error creating endorsement:', endorseError);
      return res.status(500).json({ error: 'Failed to endorse skill' });
    }

    // Get endorser info for notification
    const { data: endorser } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', endorserId)
      .single();
    
    if (endorser) {
      const endorserName = `${endorser.first_name} ${endorser.last_name}`;
      
      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: skillOwnerId,
          type: 'skill_endorsement',
          title: 'Skill Endorsement',
          message: `${endorserName} endorsed your skill`,
          reference_id: skillId,
          reference_type: 'skill'
        }]);
    }

    res.json({ message: 'Skill endorsed successfully' });
  } catch (err) {
    console.error('Error endorsing skill:', err);
    res.status(500).json({ error: 'Failed to endorse skill' });
  }
});

// Get skill endorsements
router.get('/skills/:skillId/endorsements', authenticateToken, async (req, res) => {
  try {
    const skillId = parseInt(req.params.skillId);

    const { data: endorsements, error } = await supabase
      .from('skill_endorsements')
      .select(`
        *,
        users!skill_endorsements_endorser_id_fkey (
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching endorsements:', error);
      return res.status(500).json({ error: 'Failed to fetch endorsements' });
    }

    res.json(endorsements || []);
  } catch (err) {
    console.error('Error fetching endorsements:', err);
    res.status(500).json({ error: 'Failed to fetch endorsements' });
  }
});

// Get user statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? (req as any).user.id : parseInt(req.params.id);

    // Get project count (from project_members table)
    const { count: projectCount } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // Get skill count
    const { count: skillCount } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // Get total endorsements received
    const { data: userSkills } = await supabase
      .from('skills')
      .select('id')
      .eq('user_id', userId);
    
    let endorsementCount = 0;
    if (userSkills && userSkills.length > 0) {
      const skillIds = userSkills.map(s => s.id);
      const { count } = await supabase
        .from('skill_endorsements')
        .select('*', { count: 'exact', head: true })
        .in('skill_id', skillIds);
      endorsementCount = count || 0;
    }
    
    // Get publication count (placeholder - table doesn't exist yet)
    const publicationCount = 0;
    
    // Get profile views (if the column exists)
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    const profileViews = 0; // Placeholder - profile_views column doesn't exist in schema

    // Track profile view if viewing another user's profile
    const viewerId = (req as any).user.id;
    if (viewerId !== userId) {
      // Note: profile_views tracking not implemented in current schema
      // You would need to add a profile_views table or column
    }

    res.json({
      projects: projectCount || 0,
      skills: skillCount || 0,
      endorsements: endorsementCount,
      publications: publicationCount,
      profileViews: profileViews
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

export default router;
