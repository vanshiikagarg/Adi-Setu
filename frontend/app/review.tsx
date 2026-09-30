import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../src/components/ActionButton';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { Icon } from '../src/components/Icon';
import { useApp } from '../src/context/AppContext';
import { api } from '../src/services/api';
import { colors, createThemedStyles } from '../src/theme';

export default function ReviewScreen(){const {id}=useLocalSearchParams<{id:string}>();const {data,reload}=useApp();const router=useRouter();const [confirmed,setConfirmed]=useState(false);const [saving,setSaving]=useState(false);const scholarship=data?.scholarships.find(s=>s.id===id);const draft=data?.drafts?.[id]||{};
  async function submit(){if(!confirmed||saving)return;setSaving(true);try{await api.post('/applications',{scholarshipId:id});await reload();router.replace({pathname:'/success',params:{type:'application'}})}catch{setSaving(false);}}
  return <Page><Heading eyebrow="STUDENT REVIEW & CONSENT" title="Review & confirm" subtitle="Check the information being reused. ADI SETU will not submit it without your confirmation."/><Card><View style={styles.row}><Icon name="school-outline"/><Text style={styles.title}>{scholarship?.name||'Scholarship application'}</Text></View><View style={styles.divider}/><Info label="Name" value={String(draft.studentName||data?.profile.name||'Not entered')}/><Info label="Date of birth" value={String(draft.dob||data?.profile.dob||'Not entered')}/><Info label="Email" value={String(draft.email||data?.profile.email||'Not entered')}/><Info label="Education" value={String(draft.education||'Not entered')}/><Info label="Institution" value={String(draft.institution||'Not entered')}/><Info label="Documents" value={data?.documents.length?`${data.documents.length} selected · source/status shown in wallet`:'No documents saved'}/><Info label="Award / deadline" value={`${scholarship?.range||'Not configured'} / ${scholarship?.deadline||'Not configured'}`}/></Card>
    <Card><Info label="Address" value={String(draft.address||data?.profile.address||'Not entered')}/></Card>
    <Card style={styles.trust}><View style={styles.row}><Icon name="information-circle-outline" color={colors.accent}/><Text style={styles.notice}>Prototype only. This saves a local demonstration application; it does not transmit data to a scholarship portal or verify eligibility.</Text></View></Card>
    <Pressable accessibilityRole="checkbox" accessibilityState={{checked:confirmed}} onPress={()=>setConfirmed(value=>!value)} style={styles.confirm}><View style={[styles.checkbox,confirmed&&styles.checked]}>{confirmed?<Icon name="checkmark" size={14} color={colors.textPrimary}/>:null}</View><Text style={styles.confirmText}>I reviewed the information above and want to save this prototype application.</Text></Pressable>
    <ActionButton title="Save prototype application" onPress={()=>void submit()} disabled={!confirmed} loading={saving}/><ActionButton title="Go back and edit" secondary onPress={()=>router.back()}/>
  </Page>
}
function Info({label,value}:{label:string;value:string}){return <View style={styles.info}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>}
const styles=createThemedStyles((theme) => ({row:{flexDirection:'row',gap:10,alignItems:'center'},title:{fontSize:13,fontWeight:'800',color:theme.textPrimary,flex:1},divider:{height:1,backgroundColor:theme.border,marginVertical:13},info:{paddingVertical:8,borderBottomWidth:1,borderColor:theme.border},label:{fontSize:10,color:theme.textMuted},value:{fontSize:12,fontWeight:'700',color:theme.textSecondary,marginTop:4},trust:{padding:12},notice:{fontSize:10,color:theme.textSecondary,lineHeight:16,flex:1},confirm:{flexDirection:'row',alignItems:'flex-start',gap:10,paddingHorizontal:4,paddingVertical:12},checkbox:{width:20,height:20,borderWidth:1,borderColor:theme.accent,borderRadius:5,alignItems:'center',justifyContent:'center'},checked:{backgroundColor:theme.primary,borderColor:theme.primary},confirmText:{flex:1,color:theme.textSecondary,fontSize:12,lineHeight:18}}));
