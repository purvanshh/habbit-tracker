import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS } from '../core/templates';
import { HabitTemplate } from '../core/types';

interface TemplateChipsProps {
    templates: HabitTemplate[];
    onSelect: (template: HabitTemplate) => void;
    onQuickAdd: (template: HabitTemplate) => void;
    busyTemplateId?: string | null;
}

export function TemplateChips({ templates, onSelect, onQuickAdd, busyTemplateId }: TemplateChipsProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6, gap: 10 }}>
            {templates.map((template) => {
                const color = CATEGORY_COLORS[template.category];
                const isBusy = busyTemplateId === template.id;

                return (
                    <View key={template.id} style={{ backgroundColor: '#111', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#222', width: 180 }}>
                        <TouchableOpacity onPress={() => onSelect(template)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                <Ionicons name={template.icon as any} size={18} color={color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{template.name}</Text>
                                <Text style={{ color, fontSize: 12, textTransform: 'capitalize' }}>{template.category}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => onSelect(template)} style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flex: 1, marginRight: 8 }}>
                                <Text style={{ color: '#d1d5db', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>Prefill</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={isBusy} onPress={() => onQuickAdd(template)} style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: isBusy ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)', borderWidth: 1, borderColor: color, flex: 1 }}>
                                <Text style={{ color: color, fontSize: 12, textAlign: 'center', fontWeight: '700' }}>{isBusy ? 'Adding...' : 'Quick Add'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}
