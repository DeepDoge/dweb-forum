<script lang="ts">
    import { currentRoute } from "$/routes/_routing";
    import { Feed, TimelineGroup } from "$/api/feed";
    import Timeline from "$lib/App/Timeline.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import Post from "./Post.svelte";

    export let account: string;
    let mentionsFeed: Feed = null;
    $: newPostCount = mentionsFeed?.newPostCount;
</script>

<KButton text>
    <div class="inner">
        <svg x="0" y="0" class="icon-2xnN2Y" aria-hidden="false" viewBox="0 0 24 24" fill="none">
            <path
                d="M19 3H4.99C3.88 3 3.01 3.89 3.01 5L3 19C3 20.1 3.88 21 4.99 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3ZM19 15H15C15 16.66 13.65 18 12 18C10.35 18 9 16.66 9 15H4.99V5H19V15Z"
                fill="currentColor"
            />
        </svg>
        <div class="count">{mentionsFeed ? $newPostCount : "..."}</div>
        <KHoverMenu radius="rounded" color="slave" size="normal" blur background>
            <div class="notifications">
                <b>Notifications</b>
                <Timeline bind:feed={mentionsFeed} timelineId={{ group: TimelineGroup.ProfileMentions, key: account }} let:postIds>
                    {#each postIds as postId (postId)}
                        <a href="#{$currentRoute.chainId}#{$currentRoute.path}#{postId}">
                            <Post {postId} />
                        </a>
                    {/each}
                </Timeline>
            </div>
        </KHoverMenu>
    </div>
</KButton>

<style>
    .inner {
        width: 1.5rem;
        aspect-ratio: 1/1;
        display: grid;
        place-items: stretch;
    }

    .notifications {
        width: 40em;
        max-width: 100%;
        padding: calc(var(--k-padding) * 2);
    }

    .notifications > b {
        font-size: var(--k-font-larger);
    }

    .count {
        display: grid;
        place-items: center;
        --size: 2ch;
        height: var(--size);
        min-width: var(--size);
        padding: 0 var(--k-padding);
        line-height: 0;
        letter-spacing: 0;
        border-radius: var(--k-border-radius-fab);

        position: absolute;
        top: 0;
        right: 0;

        transform: translate(50%, -50%);
        color: var(--k-color-light);
        background-color: var(--k-color-master);
    }
</style>
