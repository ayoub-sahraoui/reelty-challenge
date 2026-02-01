"use client";

import React from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Image as ImageIcon, Video as VideoIcon, Loader2 } from "lucide-react";
import Draggable from "./ui/draggable";
import { ClipType } from "@/lib/video-editor/types";

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  src: {
    medium: string;
    original: string;
  };
  alt: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    name: string;
  };
  video_files: {
    link: string;
  }[];
}

type MediaType = "photos" | "videos";

const MediaLibrary = observer(() => {
  const store = useLocalObservable(() => ({
    query: "nature",
    mediaType: "photos" as MediaType,
    photos: [] as PexelsPhoto[],
    videos: [] as PexelsVideo[],
    loading: false,
    error: null as string | null,

    setQuery(value: string) {
      this.query = value;
    },

    setLoading(value: boolean) {
      this.loading = value;
    },

    setError(value: string | null) {
      this.error = value;
    },

    setPhotos(value: PexelsPhoto[]) {
      this.photos = value;
    },

    setVideos(value: PexelsVideo[]) {
      this.videos = value;
    },

    setMediaType(type: MediaType) {
      this.mediaType = type;
      this.fetchMedia();
    },

    async fetchMedia() {
      if (!this.query) return;

      this.setLoading(true);
      this.setError(null);

      try {
        if (!PEXELS_API_KEY) {
          throw new Error("Invalid API Key. Please check your Pexels API Key.");
        }

        const endpoint = this.mediaType === "photos" ? "v1/search" : "videos/search";
        const url = `https://api.pexels.com/${endpoint}?query=${encodeURIComponent(this.query)}&per_page=20`;

        const res = await fetch(url, {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Invalid API Key. Please check your Pexels API Key.");
          }
          throw new Error("Failed to fetch media");
        }

        const data = await res.json();

        if (this.mediaType === "photos") {
          this.setPhotos(data.photos || []);
        } else {
          this.setVideos(data.videos || []);
        }
      } catch (err) {
        this.setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        this.setLoading(false);
      }
    },

    handleSearch(e: React.FormEvent) {
      e.preventDefault();
      this.fetchMedia();
    },

    get currentMedia() {
      return this.mediaType === "photos" ? this.photos : this.videos;
    },

    get hasNoResults() {
      return !this.loading && this.currentMedia.length === 0;
    },
  }));

  React.useEffect(() => {
    store.fetchMedia();
  }, []);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-col gap-4 border-b p-4">
        <h1 className="text-sm font-semibold">Media Library</h1>
        <form onSubmit={(e) => store.handleSearch(e)} className="flex gap-2">
          <Input
            value={store.query}
            onChange={(e) => store.setQuery(e.target.value)}
            placeholder="Search..."
            className="h-9"
          />
          <Button type="submit" size="sm" variant="secondary" className="px-3">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="grid w-full grid-cols-2 rounded-lg bg-zinc-100 p-1">
          <button
            onClick={() => store.setMediaType("photos")}
            className={`flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-all ${
              store.mediaType === "photos"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" /> Photos
          </button>
          <button
            onClick={() => store.setMediaType("videos")}
            className={`flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-all ${
              store.mediaType === "videos"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <VideoIcon className="h-3.5 w-3.5" /> Videos
          </button>
        </div>
      </div>

      <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-200 flex-1 overflow-y-auto p-4">
        {store.error ? (
          <div className="flex h-20 items-center justify-center rounded-md border border-red-100 bg-red-50 p-4 text-center text-xs text-red-500 italic">
            {store.error.includes("API Key") ? (
              <span>
                MISSING API KEY:
                <br />
                Add standard Pexels Key in code or env
              </span>
            ) : (
              store.error
            )}
          </div>
        ) : store.loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {store.mediaType === "photos"
              ? store.photos.map((photo) => (
                  <Draggable key={photo.id} type={ClipType.Image} data={photo}>
                    <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-transparent bg-zinc-100 transition-all hover:border-blue-500">
                      <img
                        src={photo.src.medium}
                        alt={photo.alt}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="max-w-full truncate px-1 text-[10px] text-white">
                          {photo.photographer}
                        </p>
                      </div>
                    </div>
                  </Draggable>
                ))
              : store.videos.map((video) => (
                  <Draggable key={video.id} type={ClipType.Video} data={video}>
                    <div className="group relative col-span-2 aspect-video cursor-pointer overflow-hidden rounded-md border border-transparent bg-zinc-100 transition-all hover:border-blue-500">
                      <img
                        src={video.image}
                        alt={`Video by ${video.user.name}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
                        <VideoIcon className="h-3 w-3" />
                        {video.duration}s
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded-full bg-white/90 p-1.5 backdrop-blur-sm">
                          <div className="ml-0.5 h-0 w-0 border-t-[5px] border-b-[5px] border-l-8 border-t-transparent border-b-transparent border-l-black"></div>
                        </div>
                      </div>
                    </div>
                  </Draggable>
                ))}

            {store.hasNoResults && (
              <div className="col-span-2 py-8 text-center text-xs text-zinc-400">
                No results found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default MediaLibrary;
