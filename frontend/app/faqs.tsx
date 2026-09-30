import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { Icon } from '../src/components/Icon';
import { colors, createThemedStyles, useThemeRevision } from '../src/theme';

const items=[['What is this app?','A mobile prototype of a scholarship passport and application flow.'],['Does it connect to DigiLocker?','No. The consent and document selection are simulated for this prototype; there is no live sign-in or ST verification.'],['Are the documents real?','No. The list contains sample document types only.'],['How do I track an application?','Open My Applications to see sample applications saved in this prototype.']];
export default function FaqsScreen(){useThemeRevision();const [open,setOpen]=useState<number|null>(null);return <Page><Heading eyebrow="HELP CENTRE" title="FAQs" subtitle="Quick answers to common questions."/><Card>{items.map(([q,a],i)=><Pressable key={q} onPress={()=>setOpen(open===i?null:i)} style={styles.item}><View style={styles.top}><Text style={styles.question}>{q}</Text><Icon name={open===i?'close':'chevron-forward'} size={18}/></View>{open===i&&<Text style={styles.answer}>{a}</Text>}</Pressable>)}</Card></Page>}
const styles=createThemedStyles((theme) => ({item:{paddingVertical:14,borderBottomWidth:1,borderColor:theme.border},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},question:{fontSize:12,fontWeight:'700',color:theme.textPrimary,flex:1},answer:{fontSize:11,color:theme.textMuted,lineHeight:17,marginTop:10}}));
