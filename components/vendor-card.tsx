import Image from 'next/image';import Link from "next/link";import {ArrowRight,MapPin,Star, BadgeCheck} from "lucide-react";import {money} from "@/lib/utils";import {photo,weddingCategoryPhoto} from "@/lib/data";import {FavoriteButton} from "@/components/favorite-button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VendorCard({vendor:v, isFavorited=false}: {vendor: any, isFavorited?: boolean}){
  const id = v.id;
  const name = v.name;
  const image = v.imageUrl || v.image; // fallback to mock image
  const categoryName = v.category?.name || v.category || "Vendor";
  const selectedImage = weddingCategoryPhoto(image, categoryName);
  const imgSrc = selectedImage.includes("http") ? selectedImage : photo(selectedImage);
  const verified = v.verified || v.verification === "VERIFIED";
  const area = v.area;
  const city = v.city;
  const rating = v.rating;
  const reviews = v.reviews ?? v.reviewCount ?? 0;
  const price = v.price ?? v.startingPrice;

  return <article className="group overflow-hidden rounded-2xl border border-[#e9e4de] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5"><div className="relative aspect-[1.35] overflow-hidden"><Link href={`/vendors/${id}`} aria-label={`View ${name}`}><Image fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" src={imgSrc} alt={`${categoryName}: ${name}`} className="object-cover transition duration-700 group-hover:scale-[1.04]"/></Link><FavoriteButton id={id} name={name} initialSaved={isFavorited}/><span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] tracking-wide">{categoryName}</span>{verified&&<span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] text-[#74584c]"><BadgeCheck size={13} className="text-[#ad806d]"/>Verified</span>}</div><div className="p-5"><div className="flex items-start justify-between gap-2"><Link href={`/vendors/${id}`} className="serif text-[21px] leading-tight hover:text-[#a86e64]">{name}</Link></div><div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[#817970]"><MapPin size={13} aria-hidden="true"/><span>{area ? `${area}, ` : ""}{city}</span><span className="mx-1">·</span><Star size={13} className="fill-[#ba9973] text-[#ba9973]"/><b className="text-[#302d29]">{Number(rating || 0).toFixed(1)}</b><span>({reviews} reviews)</span></div><div className="mt-5 flex items-end justify-between border-t border-[#eeeae5] pt-4"><span className="text-[11px] text-[#817970]">Starting from<br/><b className="mt-1 inline-block text-sm font-semibold text-[#302d29]">{money(Number(price || 0))}</b></span><Link href={`/vendors/${id}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8d0c8] px-4 text-xs font-medium transition hover:border-[#302d29] hover:bg-[#302d29] hover:text-white">View vendor <ArrowRight size={13}/></Link></div></div></article>;
}

