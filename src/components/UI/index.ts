/**
 * PurePixel UI primitives.
 *
 * Import from this barrel in page code (`import { Button, Card } from "../UI"`). Every primitive
 * reads the tokens in `src/theme/tokens.ts`; none of them hardcode colours, sizes or shadows.
 */
export { default as Avatar, type AvatarSize } from "./Avatar";
export {
  default as Button,
  type ButtonSize,
  type ButtonVariant,
} from "./Button";
export { default as Card, type CardPadding } from "./Card";
export { default as EmptyState } from "./EmptyState";
export { default as FilterChip } from "./FilterChip";
export { default as IconButton } from "./IconButton";
export { default as InfiniteLoader } from "./InfiniteLoader";
export { default as PriceTag, type PriceTagSize } from "./PriceTag";
export {
  default as SearchField,
} from "./SearchField";
export { default as SectionHeader } from "./SectionHeader";
export {
  default as SegmentedControl,
  type SegmentedOption,
} from "./SegmentedControl";
export {
  CardGridSkeleton,
  PhotoGridSkeleton,
  SkeletonBlock,
  SkeletonText,
} from "./Skeleton";
export { default as Spinner } from "./Spinner";
export { default as Stat } from "./Stat";
export { default as Tag, type TagTone } from "./Tag";
