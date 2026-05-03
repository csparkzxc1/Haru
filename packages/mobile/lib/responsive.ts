/**
 * 반응형 layout 헬퍼.
 *
 * iPad mini(744pt 가로) ~ iPad Pro 12.9"(1024pt 가로) / 갤럭시 탭 등은
 *   - 세로(< 768pt): 폰 레이아웃 (단일 칼럼 + 하단 탭)
 *   - 가로(≥ 768pt): split view (좌 사이드바 360pt + 우 디테일)
 *
 * 768 은 iOS 의 size class regular/compact 분기 기준에 가깝다.
 */

import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

const TABLET_BREAKPOINT = 768;

export function useScreenSize() {
  const [size, setSize] = useState(() => Dimensions.get("window"));
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setSize(window);
    });
    return () => sub.remove();
  }, []);
  return size;
}

export function useIsTablet(): boolean {
  const { width } = useScreenSize();
  return width >= TABLET_BREAKPOINT;
}
