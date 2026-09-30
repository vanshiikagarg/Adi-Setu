import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '../src/components/ActionButton';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { StatusPill } from '../src/components/StatusPill';
import { Icon, AppIconName } from '../src/components/Icon';
import { useApp } from '../src/context/AppContext';
import { Profile } from '../src/types';
import { colors, createThemedStyles } from '../src/theme';

const profileFields:[keyof Profile,string,AppIconName][]=[['name','Name','person-outline'],['dob','Date of birth','calendar-days'],['guardianName','Guardian information','person-outline'],['domicile','Domicile','map-pin'],['education','Education level','graduation-cap'],['institution','Institution','business-outline'],['course','Course','book-open'],['academicInfo','Academic information','book-open'],['familyIncome','Family income','file-check'],['email','Email','info']];

export default function PassportScreen(){const {data,updateProfile}=useApp();const router=useRouter();const profile=data?.profile;const [editing,setEditing]=useState(false);const [values,setValues]=useState<Record<string,string>>({});const [saving,setSaving]=useState(false);
  useEffect(()=>{if(profile&&!editing)setValues(Object.fromEntries(profileFields.map(([key])=>[key,String(profile[key]||'')])));},[profile,editing]);
  async function save(){setSaving(true);try{await updateProfile(values as Partial<Profile>);setEditing(false);}catch(error){Alert.alert('Scholarship Passport',error instanceof Error?error.message:'Could not save your profile.');}finally{setSaving(false);}}
  const completion=profile?.completion||0;
  return <Page><Heading eyebrow="REUSABLE STUDENT PROFILE" title="Scholarship Passport" subtitle="Review and update information here. Application drafts prefill these fields for you to check before continuing."/>
    <Card><View style={styles.row}><View style={styles.progress}><Text style={styles.percent}>{completion}%</Text></View><View style={{flex:1}}><Text style={styles.title}>Profile completion</Text><Text style={styles.copy}>Student-entered information · source details are not recorded for each field.</Text></View></View></Card>
    <Card><View style={styles.sectionRow}><Text style={styles.title}>Personal & education details</Text>{!editing?<Pressable accessibilityRole="button" onPress={()=>setEditing(true)}><Text style={styles.edit}>Edit</Text></Pressable>:null}</View>{profileFields.map(([key,label,icon])=><View key={key} style={styles.item}><Icon name={icon} size={19} color={colors.accent}/><View style={{flex:1}}><Text style={styles.copy}>{label}</Text>{editing?<TextInput value={values[key]||''} onChangeText={value=>setValues(current=>({...current,[key]:value}))} placeholder={`Enter ${label.toLowerCase()}`} placeholderTextColor={colors.textMuted} style={styles.input}/>:<Text style={styles.value}>{String(profile?.[key]||'Not provided')}</Text>}</View></View>)}{editing?<><ActionButton title="Save profile" loading={saving} onPress={()=>void save()}/><ActionButton title="Cancel" secondary onPress={()=>setEditing(false)}/></>:null}</Card>
    <Card><View style={styles.row}><Icon name={profile?.stVerified===true?'badge-check':profile?.stVerified===false?'circle-alert':'shield-checkmark-outline'} color={profile?.stVerified===true?colors.verified:profile?.stVerified===false?colors.error:colors.accent}/><View style={{flex:1}}><Text style={styles.title}>ST certificate verification</Text><Text style={styles.copy}>{profile?.stVerificationMessage||'Not verified. DigiLocker login alone does not verify ST status.'}</Text></View>{profile?.stVerified===true?<StatusPill label="Verified" tone="verified"/>:null}</View></Card>
    <ActionButton title="Review DigiLocker document consent" secondary onPress={()=>router.push('/connect')}/>
    <Text style={styles.notice}>Before an application is saved, you will review the prefilled information and explicitly confirm it.</Text>
  </Page>
}
const styles=createThemedStyles((theme) => ({row:{flexDirection:'row',alignItems:'center',gap:12},progress:{width:58,height:58,borderRadius:32,borderWidth:4,borderColor:theme.primary,alignItems:'center',justifyContent:'center'},percent:{fontSize:13,fontWeight:'800',color:theme.accent},title:{fontSize:13,fontWeight:'800',color:theme.textPrimary},copy:{fontSize:10,color:theme.textMuted,lineHeight:16,marginTop:4},sectionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},edit:{fontSize:12,fontWeight:'700',color:theme.accent},item:{flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1,borderColor:theme.border,paddingVertical:10},value:{fontSize:12,fontWeight:'700',color:theme.textSecondary,marginTop:4},input:{minHeight:38,marginTop:4,borderWidth:1,borderColor:theme.border,borderRadius:9,backgroundColor:theme.input,color:theme.textPrimary,paddingHorizontal:10,fontSize:12},notice:{fontSize:10,color:theme.textMuted,lineHeight:16,textAlign:'center',marginTop:8}}));
