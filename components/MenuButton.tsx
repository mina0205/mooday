import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  StyleSheet, SafeAreaView, Pressable,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const MENU_ITEMS = [
  { label: '📅  캘린더',      route: '/(tabs)/calendar'       },
  { label: '💝  D-Day',       route: '/(tabs)/dday'           },
  { label: '🔗  커플 초대',   route: '/(tabs)/invite'         },
  { label: '🩷  위시리스트',  route: '/(tabs)/wishlist'       },
  { label: '✨  AI 데이트 추천', route: '/(tabs)/recommendation' },
  { label: '⚙️  설정',        route: '/(tabs)/logout'         },
];

export default function MenuButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNav = (route: string) => {
    setOpen(false);
    router.push(route as any);
  };

  return (
    <>
      {/* 햄버거 버튼 */}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>☰</Text>
      </TouchableOpacity>

      {/* 메뉴 모달 */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <SafeAreaView style={styles.menuBox}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}> MOODAY</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {MENU_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.route.replace('/(tabs)', ''));
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleNav(item.route)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F58A7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  fabText: {
    fontSize: 20,
    color: '#F58A7A',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F58A7A',
    letterSpacing: 4,
  },
  closeBtn: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#FFF0F3',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  menuItemTextActive: {
    color: '#F58A7A',
    fontWeight: '700',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F58A7A',
  },
});