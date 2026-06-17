import { useState } from "react";
import styled from "styled-components";
import AnimeIcon from "../../assets/categoryIcons/animation.svg";
import FoodIcon from "../../assets/categoryIcons/food.svg";
import PhotoIcon from "../../assets/categoryIcons/photo.svg";
import ShopingIcon from "../../assets/categoryIcons/shoping.svg";
import ViewIcon from "../../assets/categoryIcons/view.svg";
import { useI18n } from "../../i18n/I18nProvider";

const CATEGORIES = [
  { icon: AnimeIcon, label: "애니메이션", id: "anime", category: "애니메이션" },
  { icon: FoodIcon, label: "음식", id: "food", category: "맛집" },
  { icon: ViewIcon, label: "풍경", id: "nature", category: "풍경" },
  { icon: PhotoIcon, label: "사진", id: "photo", category: "사진" },
  { icon: ShopingIcon, label: "쇼핑", id: "shopping", category: "쇼핑" },
];

const Wrapper = styled.div`
  width: min(var(--app-page-width), 100vw);
  background: #f3f4f3;
  margin-left: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
`;

const Title = styled.div`
  width: 180px;
  margin-left: 21px;
  padding: 12px 8px;
  padding-top: 20px;
  font-size: 18px;
  font-weight: 700;
  color: #111;
  line-height: 1.4;
  white-space: nowrap;
`;

const IconRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 21px;
  margin-top: 0;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const Circle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 95px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: ${({ $active }) => ($active ? "2px solid #4CAF50" : "none")};
`;

const IconImg = styled.img`
  width: 38px;
  height: 30px;
  object-fit: contain;
`;

const Label = styled.span`
  width: 56px;
  font-size: 11px;
  color: #4e4e4e;
  text-align: center;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  white-space: nowrap;
`;

export default function CategoryFilter({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const { t } = useI18n();

  const handleSelect = (category) => {
    setSelected(category.id);
    onSelect?.(category.category);
  };

  return (
    <Wrapper>
      <Title>{t("취향에 맞춰 찾아볼까요")}</Title>
      <IconRow>
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <Item key={cat.id} onClick={() => handleSelect(cat)}>
              <Circle $active={isActive}>
                <IconImg src={cat.icon} alt={t(cat.label)} />
              </Circle>
              <Label $active={isActive}>{t(cat.label)}</Label>
            </Item>
          );
        })}
      </IconRow>
    </Wrapper>
  );
}
