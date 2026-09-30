import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Heading, Page } from '../../src/components/Page';
import { StatusPill } from '../../src/components/StatusPill';
import { Icon } from '../../src/components/Icon';
import { useApp } from '../../src/context/AppContext';
import { colors, createThemedStyles } from '../../src/theme';

type Filter='All'|'In progress'|'Not started';
export default function ScholarshipsScreen(){
  const {data}=useApp();const router=useRouter();const [filter,setFilter]=useState<Filter>('All');const [query,setQuery]=useState('');
  const items=useMemo(()=>data?.scholarships.filter(s=>{
    const application=data?.applications.find(a=>a.scholarshipId===s.id);
    const inProgress=Boolean(application||data?.drafts?.[s.id]);
    return (filter==='All'||(filter==='In progress'?inProgress:!inProgress))&&s.name.toLowerCase().includes(query.toLowerCase());
  })||[],[data,filter,query]);
  return <Page><Heading title="Scholarships" subtitle="Explore the five schemes in one catalogue. Check each scheme’s current official details before applying."/>
    <Card style={styles.notice}><View style={styles.row}><Icon name="information-circle-outline" color={colors.accent}/><Text style={styles.note}>Prototype catalogue · Eligibility, award details, deadlines and required documents are not connected to official scheme data.</Text></View></Card>
    <View style={styles.filters}>{(['All','In progress','Not started'] as Filter[]).map(value=><Pressable key={value} accessibilityRole="button" accessibilityState={{selected:filter===value}} onPress={()=>setFilter(value)} style={[styles.filter,filter===value&&styles.selected]}><Text style={[styles.filterText,filter===value&&styles.selectedText]}>{value}</Text></Pressable>)}</View>
    <View style={styles.search}><Icon name="search-outline" color={colors.textMuted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search the five schemes" placeholderTextColor={colors.textMuted} style={styles.input}/></View>
    {items.map(s=>{const application=data?.applications.find(a=>a.scholarshipId===s.id);const draft=Boolean(data?.drafts?.[s.id]);return <Pressable key={s.id} onPress={()=>router.push({pathname:'/scholarship/[id]',params:{id:s.id}})}><Card><View style={styles.row}><View style={styles.iconTile}><Icon name="school-outline" size={21}/></View><View style={styles.details}><Text style={styles.name}>{s.name}</Text><Text style={styles.meta}>{s.level}</Text><View style={styles.pill}><StatusPill label={application?.status||(draft?'Draft':s.status||'Not assessed')} tone={application?'info':'pending'}/></View></View><Icon name="chevron-forward"/></View>
      <View style={styles.foot}><Text style={styles.meta}>{application?`Current stage: ${application.stage}`:draft?'Incomplete draft saved':'No application recorded'}</Text><Text style={styles.action}>{application||draft?'Continue / track':'View scheme'} </Text></View>
      {s.deadline?<Text style={styles.deadline}>Configured deadline: {s.deadline}</Text>:null}
    </Card></Pressable>})}
    {!items.length&&<Card><Text style={styles.meta}>No schemes match this search or filter.</Text></Card>}
  </Page>
}
const styles=createThemedStyles((theme) => ({notice:{padding:12},row:{flexDirection:'row',alignItems:'center',gap:10},note:{flex:1,fontSize:11,lineHeight:16,color:theme.textSecondary},filters:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},filter:{borderRadius:30,paddingHorizontal:13,paddingVertical:8,backgroundColor:theme.surfaceStrong},selected:{backgroundColor:theme.primary},filterText:{fontSize:11,fontWeight:'700',color:theme.textMuted},selectedText:{color:theme.textPrimary},search:{height:43,borderWidth:1,borderColor:theme.border,borderRadius:11,backgroundColor:theme.input,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:11,marginBottom:13},input:{flex:1,fontSize:12,color:theme.textSecondary},iconTile:{width:43,height:43,borderRadius:12,backgroundColor:theme.surfaceStrong,alignItems:'center',justifyContent:'center'},details:{flex:1},name:{fontSize:13,fontWeight:'800',color:theme.textPrimary,lineHeight:18},meta:{fontSize:10,color:theme.textMuted,marginTop:3},pill:{marginTop:7,alignSelf:'flex-start'},foot:{flexDirection:'row',justifyContent:'space-between',gap:7,marginLeft:54,marginTop:10},action:{fontSize:10,fontWeight:'700',color:theme.primary},deadline:{fontSize:10,color:theme.textMuted,marginLeft:54,marginTop:8}}));
