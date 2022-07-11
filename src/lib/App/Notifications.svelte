<script lang="ts">
    import { currentRoute } from "$/routes/_routing.svelte";
    import { getTimeline,Timeline as TImelineType,TimelineGroup } from "$/tools/api/app";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import Post from "./Post.svelte";
    import Timeline from "./Timeline.svelte";

    export let account: string;
    let mentionsTimeline: TImelineType = null;
    $: newPostCount = mentionsTimeline?.newPostCount;

    $: account, onAccountChange();
    async function onAccountChange() {
        mentionsTimeline = null;
        mentionsTimeline = await getTimeline({ timelineId: { group: TimelineGroup.ProfileMentions, key: account } });
    }
</script>

<KButton text radius="rounded">
    <div class="inner">
        <svg x="0" y="0" class="icon-2xnN2Y" aria-hidden="false" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
                d="M19 3H4.99C3.88 3 3.01 3.89 3.01 5L3 19C3 20.1 3.88 21 4.99 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3ZM19 15H15C15 16.66 13.65 18 12 18C10.35 18 9 16.66 9 15H4.99V5H19V15Z"
                fill="currentColor"
            />
        </svg>
        <div class="count">{mentionsTimeline ? $newPostCount : "..."}</div>
        {#if mentionsTimeline}
            <KHoverMenu radius="rounded" color="master" size="normal" background>
                <div class="notifications">
                    <b>Notifications</b>
                    <Timeline timeline={mentionsTimeline} let:postIds>
                        {#each postIds as postId (postId)}
                            <a href="#{$currentRoute.path}#{postId}">
                                <Post {postId} />
                            </a>
                        {/each}
                    </Timeline>
                </div>
            </KHoverMenu>
        {/if}
    </div>
</KButton>

<style>
    .inner {
        border-left: solid calc(var(--k-padding) * 3) transparent;
        border-right: solid calc(var(--k-padding) * 3) transparent;
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
        background-color: var(--k-color-master);
    }
</style>
