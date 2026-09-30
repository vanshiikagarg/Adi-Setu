import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '../../src/components/ActionButton';
import { Card } from '../../src/components/Card';
import { Heading, Page } from '../../src/components/Page';
import { Icon, AppIconName } from '../../src/components/Icon';
import { useApp } from '../../src/context/AppContext';
import { useProfilePhoto } from '../../src/context/ProfilePhotoContext';
import { colors, createThemedStyles } from '../../src/theme';

const links:[string,AppIconName,string][]=[['Scholarship Passport','shield-checkmark-outline','/passport'],['My applications','clipboard-check','/applications'],['Settings','settings-outline','/settings'],['Help & Support','help-circle-outline','/help'],['FAQs','information-circle-outline','/faqs']];
export default function ProfileScreen(){
  const {data,updateProfile}=useApp();
  const router=useRouter();
  const profile=data?.profile;
  const {uri:profilePhotoUri}=useProfilePhoto();
  const [sampleName,setSampleName]=useState('Asha');
  const [email,setEmail]=useState('');
  const [dob,setDob]=useState('');
  const [address,setAddress]=useState('');
  const [education,setEducation]=useState('');
  const [institution,setInstitution]=useState('');
  const [familyIncome,setFamilyIncome]=useState('');
  const [saved,setSaved]=useState(false);
  useEffect(()=>{
    setSampleName(profile?.name||'Asha');
    setEmail(profile?.email||'');
    setDob(profile?.dob||'');
    setAddress(profile?.address||'');
    setEducation(profile?.education||'');
    setInstitution(profile?.institution||'');
    setFamilyIncome(profile?.familyIncome||'');
  },[profile?.name,profile?.email,profile?.dob,profile?.address,profile?.education,profile?.institution,profile?.familyIncome]);
  async function saveProfile(){
    try {
      await updateProfile({name:sampleName.trim().slice(0,60)||'Asha',email:email.trim()||null,dob:dob.trim()||null,address:address.trim()||null,education:education.trim()||null,institution:institution.trim()||null,familyIncome:familyIncome.trim()||null});
      setSaved(true);
    }
    catch(error){Alert.alert('Profile',error instanceof Error?error.message:'Could not save the profile.');}
  }
  return <Page><Heading eyebrow="YOUR ACCOUNT" title="Profile" subtitle="Review or edit these sample details. They are saved only in this prototype."/>
    <Card><View style={styles.profile}><Pressable accessibilityRole="button" accessibilityLabel="Choose profile picture" onPress={()=>router.push('/profile-photo')} style={styles.avatar}>{profilePhotoUri?<Image source={{uri:profilePhotoUri}} style={styles.avatarImage}/>:<Icon name="person-outline" size={32} color={colors.accent}/>}</Pressable><View style={{flex:1}}><Text style={styles.name}>{profile?.name||'Asha'}</Text><Text style={styles.meta}>Sample student profile</Text></View></View><View style={styles.linked}><Icon name="checkmark-circle" size={17} color={colors.primary}/><Text style={styles.linkedText}>{profile?.connected?'Prototype profile active':'Sample profile ready'}</Text></View></Card>
    <Card>
      <Text style={styles.sectionTitle}>Personal details</Text>
      <Text style={styles.fieldLabel}>Name</Text><TextInput value={sampleName} onChangeText={value=>{setSampleName(value);setSaved(false)}} placeholder="Asha" placeholderTextColor={colors.textMuted} style={styles.input} maxLength={60} autoCapitalize="words" returnKeyType="next"/>
      <Text style={styles.fieldLabel}>Email</Text><TextInput value={email} onChangeText={value=>{setEmail(value);setSaved(false)}} placeholder="Enter your email" placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="email-address" autoCapitalize="none" returnKeyType="next"/>
      <Text style={styles.fieldLabel}>Date of birth</Text><TextInput value={dob} onChangeText={value=>{setDob(value);setSaved(false)}} placeholder="DD/MM/YYYY" placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numbers-and-punctuation" returnKeyType="next"/>
      <Text style={styles.fieldLabel}>Address</Text><TextInput value={address} onChangeText={value=>{setAddress(value);setSaved(false)}} placeholder="Sample address" placeholderTextColor={colors.textMuted} style={styles.input} autoCapitalize="words" returnKeyType="next"/>
      <Text style={styles.fieldLabel}>Education</Text><TextInput value={education} onChangeText={value=>{setEducation(value);setSaved(false)}} placeholder="Enter your class or course" placeholderTextColor={colors.textMuted} style={styles.input} returnKeyType="next"/>
      <Text style={styles.fieldLabel}>Institution</Text><TextInput value={institution} onChangeText={value=>{setInstitution(value);setSaved(false)}} placeholder="Enter your institution" placeholderTextColor={colors.textMuted} style={styles.input} autoCapitalize="words" returnKeyType="next"/>
      <Text style={styles.fieldLabel}>Family income</Text><TextInput value={familyIncome} onChangeText={value=>{setFamilyIncome(value);setSaved(false)}} placeholder="Enter annual family income" placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="decimal-pad" returnKeyType="done"/>
      <ActionButton title={saved?'Details saved':'Save profile details'} secondary onPress={()=>void saveProfile()}/>
    </Card>
    {links.map(([title,icon,path])=><Pressable key={path} onPress={()=>router.push(path as never)}><Card style={styles.linkCard}><Icon name={icon}/><Text style={styles.linkTitle}>{title}</Text><Icon name="chevron-forward" color={colors.textMuted}/></Card></Pressable>)}
  </Page>;
}
const styles=createThemedStyles((theme) => ({profile:{flexDirection:'row',alignItems:'center',gap:13},avatar:{width:58,height:58,borderRadius:32,backgroundColor:theme.surfaceStrong,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:theme.secondary,overflow:'hidden'},avatarImage:{width:'100%',height:'100%'},name:{fontSize:15,fontWeight:'800',color:theme.textPrimary},meta:{fontSize:10,color:theme.textMuted,marginTop:5},linked:{borderTopWidth:1,borderColor:theme.border,marginTop:15,paddingTop:12,flexDirection:'row',alignItems:'center',gap:7},linkedText:{fontSize:11,fontWeight:'700',color:theme.primary},sectionTitle:{fontSize:13,fontWeight:'800',color:theme.textPrimary},fieldLabel:{fontSize:11,fontWeight:'700',color:theme.textSecondary,marginTop:12},input:{height:46,borderWidth:1,borderColor:theme.border,borderRadius:10,paddingHorizontal:12,marginTop:6,color:theme.textSecondary,backgroundColor:theme.input,fontSize:13},linkCard:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:14},linkTitle:{flex:1,fontSize:12,fontWeight:'600',color:theme.textSecondary}}));
